import { supabase } from './supabase';
import type { PlaceType, PublicStatus } from './types';

export interface QueueItem {
  id: string;
  title: string;
  description: string;
  type: PlaceType;
  category_id: string;
  proposal: string | null;
  location_label: string | null;
  created_at: string;
  lng: number;
  lat: number;
  mediaUrls?: string[];
}

// Coda privata delle segnalazioni ricevute (visibile solo ai moderatori via RLS).
export async function fetchQueue(): Promise<QueueItem[]> {
  const { data, error } = await supabase
    .from('submissions_queue')
    .select(
      'id, title, description, type, category_id, proposal, location_label, created_at, lng, lat',
    )
    .eq('internal_status', 'ricevuta')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as QueueItem[];
}

// URL firmati (temporanei) delle foto nel bucket privato `pending-media`.
// Il moderatore può leggere il bucket privato (policy `pending_all_moderator`).
export async function fetchSubmissionMedia(submissionId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('media')
    .select('path')
    .eq('submission_id', submissionId)
    .eq('bucket', 'pending-media');
  if (error) throw error;

  const urls: string[] = [];
  for (const row of data ?? []) {
    const { data: signed } = await supabase.storage
      .from('pending-media')
      .createSignedUrl((row as { path: string }).path, 600);
    if (signed?.signedUrl) urls.push(signed.signedUrl);
  }
  return urls;
}

export async function rejectSubmission(id: string, reason: string): Promise<void> {
  const { error } = await supabase.rpc('reject_submission', {
    p_submission_id: id,
    p_reason: reason,
  });
  if (error) throw error;
}

export interface PublishInput {
  submissionId: string;
  title: string;
  summary?: string;
  description?: string;
  proposal?: string;
  publicStatus: PublicStatus;
}

export async function publishSubmission(input: PublishInput): Promise<string> {
  const { data, error } = await supabase.rpc('publish_submission', {
    p_submission_id: input.submissionId,
    p_title: input.title,
    p_summary: input.summary ?? null,
    p_description: input.description ?? null,
    p_proposal: input.proposal ?? null,
    p_public_status: input.publicStatus,
  });
  if (error) throw error;
  return data as string;
}

export async function setPlaceStatus(
  placeId: string,
  status: PublicStatus,
  note?: string,
): Promise<void> {
  const { error } = await supabase.rpc('set_place_status', {
    p_place_id: placeId,
    p_status: status,
    p_note: note ?? null,
  });
  if (error) throw error;
}

function contentTypeFor(path: string): string {
  if (path.endsWith('.png')) return 'image/png';
  if (path.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}

// Promuove una singola foto da `pending-media` (privato) a `public-media`
// (pubblico), aggiorna la riga e la collega alla scheda. Il moderatore ha i
// permessi RLS su entrambi i bucket, quindi la copia avviene lato client.
async function promoteOne(
  mediaId: string,
  path: string,
  placeId: string,
): Promise<void> {
  const dl = await supabase.storage.from('pending-media').download(path);
  if (dl.error || !dl.data) throw dl.error ?? new Error('Download foto fallito');

  const up = await supabase.storage
    .from('public-media')
    .upload(path, dl.data, {
      contentType: dl.data.type || contentTypeFor(path),
      upsert: true,
    });
  if (up.error) throw up.error;

  const { error: updErr } = await supabase
    .from('media')
    .update({ bucket: 'public-media', status: 'approved', place_id: placeId })
    .eq('id', mediaId);
  if (updErr) throw updErr;

  // Best-effort: rimuove la copia privata ormai superflua.
  await supabase.storage.from('pending-media').remove([path]);
}

// Promuove tutte le foto in attesa di una segnalazione appena pubblicata e le
// collega alla scheda pubblica creata.
export async function promoteSubmissionMedia(
  submissionId: string,
  placeId: string,
): Promise<void> {
  const { data, error } = await supabase
    .from('media')
    .select('id, path')
    .eq('submission_id', submissionId)
    .eq('bucket', 'pending-media');
  if (error) throw error;

  for (const row of (data ?? []) as { id: string; path: string }[]) {
    await promoteOne(row.id, row.path, placeId);
  }
}

// Ripara le schede già pubblicate le cui foto sono rimaste nel bucket privato
// (pubblicazioni precedenti al collegamento automatico). Restituisce il numero
// di foto promosse. Idempotente: le foto già promosse non compaiono più qui.
export async function repairPublishedMedia(): Promise<number> {
  const { data: pending, error } = await supabase
    .from('media')
    .select('id, path, submission_id')
    .eq('bucket', 'pending-media');
  if (error) throw error;

  const rows = (pending ?? []) as {
    id: string;
    path: string;
    submission_id: string;
  }[];
  if (rows.length === 0) return 0;

  const subIds = [...new Set(rows.map((r) => r.submission_id))];
  const { data: places, error: pErr } = await supabase
    .from('places')
    .select('id, source_submission_id')
    .in('source_submission_id', subIds);
  if (pErr) throw pErr;

  const placeBySub = new Map<string, string>();
  for (const pl of (places ?? []) as {
    id: string;
    source_submission_id: string | null;
  }[]) {
    if (pl.source_submission_id) placeBySub.set(pl.source_submission_id, pl.id);
  }

  let promoted = 0;
  for (const row of rows) {
    const placeId = placeBySub.get(row.submission_id);
    if (!placeId) continue; // segnalazione non ancora pubblicata: resta in attesa
    await promoteOne(row.id, row.path, placeId);
    promoted += 1;
  }
  return promoted;
}

// Rimozione definitiva di una scheda pubblicata (es. segnalazioni di prova).
// Cancella le foto dallo storage, le righe media collegate e la scheda.
// Il moderatore ha i permessi RLS su places/media e su storage.objects.
export async function deletePlace(placeId: string): Promise<void> {
  const { data: rows, error: mErr } = await supabase
    .from('media')
    .select('path, bucket')
    .eq('place_id', placeId);
  if (mErr) throw mErr;

  const byBucket = new Map<string, string[]>();
  for (const r of (rows ?? []) as { path: string; bucket: string }[]) {
    const list = byBucket.get(r.bucket) ?? [];
    list.push(r.path);
    byBucket.set(r.bucket, list);
  }
  for (const [bucket, paths] of byBucket) {
    if (paths.length > 0) {
      await supabase.storage.from(bucket).remove(paths);
    }
  }

  await supabase.from('media').delete().eq('place_id', placeId);

  const { error: pErr } = await supabase.from('places').delete().eq('id', placeId);
  if (pErr) throw pErr;
}

export interface ModerationPlace {
  id: string;
  title: string;
  type: PlaceType;
  category_id: string;
  public_status: PublicStatus;
  location_label: string | null;
  hidden: boolean;
  published_at: string;
}

// Tutte le schede pubblicate (anche quelle nascoste), lette dalla tabella
// `places` con i privilegi RLS del moderatore. Serve al pannello di gestione.
export async function fetchModerationPlaces(): Promise<ModerationPlace[]> {
  const { data, error } = await supabase
    .from('places')
    .select('id, title, type, category_id, public_status, location_label, hidden, published_at')
    .order('published_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ModerationPlace[];
}

// Nasconde/mostra una scheda sulla mappa pubblica senza cancellarla.
export async function setPlaceHidden(placeId: string, hidden: boolean): Promise<void> {
  const { error } = await supabase.from('places').update({ hidden }).eq('id', placeId);
  if (error) throw error;
}

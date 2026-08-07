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

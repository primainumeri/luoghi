// Edge Function: promote-media
// Sposta le foto approvate da `pending-media` (privato) a `public-media`
// (pubblico) e aggiorna la riga `media`. Usa la service_role key, conservata
// ESCLUSIVAMENTE tra i secret della Edge Function (mai nel bundle frontend).
//
// Perché serve: il moderatore autenticato non può spostare in modo sicuro un
// file tra due bucket con i soli permessi client; questa operazione privilegiata
// (copy + delete + update stato) va eseguita server-side.
//
// Segreti richiesti (Supabase Function secrets):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//
// Autorizzazione: la funzione verifica che il chiamante sia un moderatore
// attivo usando il suo JWT (header Authorization) prima di agire.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface PromoteRequest {
  mediaId: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceKey) {
    return json({ error: 'Configurazione mancante' }, 500);
  }

  const authHeader = req.headers.get('Authorization') ?? '';

  // Client "utente": valida l'identità del chiamante rispettando le RLS.
  const userClient = createClient(supabaseUrl, serviceKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });
  const { data: isMod, error: modErr } = await userClient.rpc('is_moderator');
  if (modErr || isMod !== true) {
    return json({ error: 'Non autorizzato' }, 403);
  }

  let body: PromoteRequest;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Body non valido' }, 400);
  }
  if (!body.mediaId) {
    return json({ error: 'mediaId mancante' }, 400);
  }

  // Client di servizio: esegue l'operazione privilegiata (bypassa RLS).
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const { data: media, error: mErr } = await admin
    .from('media')
    .select('id, bucket, path, status')
    .eq('id', body.mediaId)
    .single();
  if (mErr || !media) {
    return json({ error: 'Media non trovato' }, 404);
  }
  if (media.bucket !== 'pending-media') {
    return json({ error: 'Il media non è in pending-media' }, 409);
  }

  // 1. Scarica dal bucket privato.
  const download = await admin.storage.from('pending-media').download(media.path);
  if (download.error || !download.data) {
    return json({ error: 'Download fallito' }, 500);
  }

  // 2. Carica nel bucket pubblico.
  const upload = await admin.storage
    .from('public-media')
    .upload(media.path, download.data, { upsert: true });
  if (upload.error) {
    return json({ error: 'Upload pubblico fallito' }, 500);
  }

  // 3. Aggiorna la riga media e 4. rimuove l'originale privato.
  const { error: updErr } = await admin
    .from('media')
    .update({ bucket: 'public-media', status: 'approved' })
    .eq('id', media.id);
  if (updErr) {
    return json({ error: 'Aggiornamento stato fallito' }, 500);
  }
  await admin.storage.from('pending-media').remove([media.path]);

  return json({ ok: true, path: media.path }, 200);
});

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

-- 0004 — Storage: bucket e policy.
-- Due aree separate:
--   pending-media : privato, per i caricamenti non ancora moderati;
--   public-media  : pubblico in lettura, per le sole copie approvate.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('pending-media', 'pending-media', false, 5242880, array['image/jpeg','image/png','image/webp']),
  ('public-media',  'public-media',  true,  5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- storage.objects ha già RLS abilitata da Supabase.

-- ------------------------- pending-media (privato) -------------------------
-- Anonimo: può SOLO caricare (upload), mai leggere/elencare.
drop policy if exists pending_insert_anon on storage.objects;
create policy pending_insert_anon on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'pending-media');

-- Moderatore: accesso completo al bucket privato.
drop policy if exists pending_all_moderator on storage.objects;
create policy pending_all_moderator on storage.objects
  for all to authenticated
  using (bucket_id = 'pending-media' and public.is_moderator())
  with check (bucket_id = 'pending-media' and public.is_moderator());

-- ------------------------- public-media (pubblico) -------------------------
-- Lettura pubblica.
drop policy if exists public_select_anon on storage.objects;
create policy public_select_anon on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'public-media');

-- Scrittura riservata ai moderatori (la promozione pending->public avviene via
-- Edge Function con privilegi controllati; questa policy copre la gestione
-- diretta da parte del moderatore autenticato).
drop policy if exists public_write_moderator on storage.objects;
create policy public_write_moderator on storage.objects
  for all to authenticated
  using (bucket_id = 'public-media' and public.is_moderator())
  with check (bucket_id = 'public-media' and public.is_moderator());

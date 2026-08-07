-- 0003 — Row Level Security. Principio del minimo privilegio.
-- NB: le scritture anonime (segnalazioni, contatti, riferimenti media) passano
-- SOLO dalla funzione SECURITY DEFINER submit_report(). L'anonimo NON ha quindi
-- alcun accesso diretto in scrittura né lettura alle tabelle private.

alter table public.categories        enable row level security;
alter table public.places            enable row level security;
alter table public.submissions       enable row level security;
alter table public.submitter_contacts enable row level security;
alter table public.media             enable row level security;
alter table public.place_updates     enable row level security;
alter table public.profiles          enable row level security;
alter table public.moderation_log    enable row level security;

-- --------------------------- categories ------------------------------------
drop policy if exists categories_select_active_anon on public.categories;
create policy categories_select_active_anon on public.categories
  for select to anon
  using (active = true);

drop policy if exists categories_all_moderator on public.categories;
create policy categories_select_moderator on public.categories
  for select to authenticated
  using (public.is_moderator());
create policy categories_write_admin on public.categories
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------------ places -------------------------------------
-- La tabella contiene SOLO schede pubblicate: lettura pubblica consentita.
drop policy if exists places_select_public on public.places;
create policy places_select_public on public.places
  for select to anon, authenticated
  using (true);

drop policy if exists places_write_moderator on public.places;
create policy places_write_moderator on public.places
  for all to authenticated
  using (public.is_moderator())
  with check (public.is_moderator());

-- ---------------------------- submissions ----------------------------------
-- Nessun accesso anonimo: l'inserimento avviene via submit_report().
drop policy if exists submissions_all_moderator on public.submissions;
create policy submissions_all_moderator on public.submissions
  for all to authenticated
  using (public.is_moderator())
  with check (public.is_moderator());

-- ------------------------- submitter_contacts ------------------------------
drop policy if exists contacts_all_moderator on public.submitter_contacts;
create policy contacts_all_moderator on public.submitter_contacts
  for all to authenticated
  using (public.is_moderator())
  with check (public.is_moderator());

-- ------------------------------- media -------------------------------------
-- Anonimo: legge solo le foto approvate e pubbliche.
drop policy if exists media_select_public on public.media;
create policy media_select_public on public.media
  for select to anon, authenticated
  using (status = 'approved' and bucket = 'public-media');

drop policy if exists media_all_moderator on public.media;
create policy media_all_moderator on public.media
  for all to authenticated
  using (public.is_moderator())
  with check (public.is_moderator());

-- --------------------------- place_updates ---------------------------------
drop policy if exists place_updates_select_public on public.place_updates;
create policy place_updates_select_public on public.place_updates
  for select to anon, authenticated
  using (true);

drop policy if exists place_updates_insert_moderator on public.place_updates;
create policy place_updates_insert_moderator on public.place_updates
  for insert to authenticated
  with check (public.is_moderator());

-- ------------------------------ profiles -----------------------------------
-- Ogni moderatore vede solo il proprio profilo; l'admin li gestisce tutti.
drop policy if exists profiles_select_self on public.profiles;
create policy profiles_select_self on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_admin_manage on public.profiles;
create policy profiles_admin_manage on public.profiles
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- --------------------------- moderation_log --------------------------------
drop policy if exists modlog_select_moderator on public.moderation_log;
create policy modlog_select_moderator on public.moderation_log
  for select to authenticated
  using (public.is_moderator());

drop policy if exists modlog_insert_moderator on public.moderation_log;
create policy modlog_insert_moderator on public.moderation_log
  for insert to authenticated
  with check (public.is_moderator() and moderator_id = auth.uid());

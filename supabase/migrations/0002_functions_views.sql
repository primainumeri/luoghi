-- 0002 — Funzioni e vista pubblica.

-- ---------------------------------------------------------------------------
-- is_moderator(): true se l'utente autenticato è un moderatore/admin attivo.
-- Usata da tutte le policy RLS. SECURITY DEFINER per leggere `profiles` senza
-- dipendere dalle policy della tabella stessa (evita ricorsione).
-- ---------------------------------------------------------------------------
create or replace function public.is_moderator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.active
  );
$$;

revoke all on function public.is_moderator() from public;
grant execute on function public.is_moderator() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- is_admin(): true se l'utente autenticato è un amministratore attivo.
-- SECURITY DEFINER: evita ricorsione RLS quando usata nelle policy di `profiles`.
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.active and p.role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- places_public: vista pubblica delle schede. Espone lng/lat al posto della
-- geometria e SOLO le colonne pubblicabili (nessun dato personale).
-- security_invoker: eredita le RLS della tabella `places` per il chiamante.
-- ---------------------------------------------------------------------------
create or replace view public.places_public
with (security_invoker = true) as
select
  p.id,
  p.title,
  p.summary,
  p.description,
  p.type,
  p.category_id,
  p.proposal,
  p.public_status,
  st_x(p.geom::geometry) as lng,
  st_y(p.geom::geometry) as lat,
  p.location_label,
  p.first_observed,
  p.published_at,
  p.updated_at
from public.places p;

grant select on public.places_public to anon, authenticated;

-- ---------------------------------------------------------------------------
-- submit_report(): inserimento anonimo atomico di segnalazione + contatto +
-- riferimenti media. SECURITY DEFINER perché l'anonimo non può (e non deve)
-- rileggere la coda: la funzione restituisce solo un riferimento opaco.
-- Forza internal_status='ricevuta' e media in 'pending-media'/'pending'.
-- ---------------------------------------------------------------------------
create or replace function public.submit_report(
  p_title          text,
  p_description    text,
  p_type           text,
  p_category_id    uuid,
  p_proposal       text,
  p_lng            double precision,
  p_lat            double precision,
  p_location_label text,
  p_first_observed date,
  p_email          text,
  p_consent        boolean,
  p_media_paths    text[]
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_submission_id uuid;
  v_path text;
  v_count int;
begin
  -- Validazioni minime lato server (il client valida a sua volta).
  if coalesce(btrim(p_title), '') = '' then
    raise exception 'Titolo obbligatorio';
  end if;
  if coalesce(btrim(p_description), '') = '' then
    raise exception 'Descrizione obbligatoria';
  end if;
  if p_type not in ('criticita','risorsa','proposta') then
    raise exception 'Tipo non valido';
  end if;
  if p_consent is not true then
    raise exception 'Consenso obbligatorio';
  end if;
  if p_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'E-mail non valida';
  end if;
  if p_lng < -180 or p_lng > 180 or p_lat < -90 or p_lat > 90 then
    raise exception 'Coordinate non valide';
  end if;
  if array_length(p_media_paths, 1) is not null and array_length(p_media_paths, 1) > 3 then
    raise exception 'Massimo tre fotografie';
  end if;
  if not exists (select 1 from public.categories c where c.id = p_category_id and c.active) then
    raise exception 'Categoria non valida';
  end if;

  insert into public.submissions (
    title, description, type, category_id, proposal, geom,
    location_label, first_observed, internal_status
  ) values (
    btrim(p_title), btrim(p_description), p_type, p_category_id, nullif(btrim(p_proposal), ''),
    st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography,
    nullif(btrim(p_location_label), ''), p_first_observed, 'ricevuta'
  )
  returning id into v_submission_id;

  insert into public.submitter_contacts (submission_id, email, consent)
  values (v_submission_id, btrim(p_email), p_consent);

  v_count := 0;
  if p_media_paths is not null then
    foreach v_path in array p_media_paths loop
      if btrim(v_path) <> '' then
        insert into public.media (submission_id, bucket, path, mime, size, status)
        values (v_submission_id, 'pending-media', v_path, 'application/octet-stream', 0, 'pending');
        v_count := v_count + 1;
      end if;
    end loop;
  end if;

  -- Riferimento pubblico opaco: NON è l'id interno della submission.
  return 'PL-' || upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 8));
end;
$$;

revoke all on function public.submit_report(
  text, text, text, uuid, text, double precision, double precision, text, date, text, boolean, text[]
) from public;
grant execute on function public.submit_report(
  text, text, text, uuid, text, double precision, double precision, text, date, text, boolean, text[]
) to anon, authenticated;

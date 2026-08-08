-- 0010 — Quarta tipologia "cura" (Cura in azione).
-- Tipologie: criticita, proposta, risorsa (Luoghi da custodire), cura.

alter table public.submissions drop constraint if exists submissions_type_check;
alter table public.submissions
  add constraint submissions_type_check
  check (type in ('criticita', 'risorsa', 'proposta', 'cura'));

alter table public.places drop constraint if exists places_type_check;
alter table public.places
  add constraint places_type_check
  check (type in ('criticita', 'risorsa', 'proposta', 'cura'));

alter table public.categories
  alter column types set default array['criticita', 'risorsa', 'proposta', 'cura'];

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
  p_name           text,
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
  v_email text;
begin
  if coalesce(btrim(p_title), '') = '' then
    raise exception 'Titolo obbligatorio';
  end if;
  if coalesce(btrim(p_description), '') = '' then
    raise exception 'Descrizione obbligatoria';
  end if;
  if p_type not in ('criticita', 'risorsa', 'proposta', 'cura') then
    raise exception 'Tipo non valido';
  end if;
  if p_consent is not true then
    raise exception 'Consenso obbligatorio';
  end if;

  -- E-mail facoltativa: valida il formato solo se fornita.
  v_email := nullif(btrim(coalesce(p_email, '')), '');
  if v_email is not null and v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
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

  insert into public.submitter_contacts (submission_id, email, name, consent)
  values (v_submission_id, v_email, nullif(btrim(coalesce(p_name, '')), ''), p_consent);

  if p_media_paths is not null then
    foreach v_path in array p_media_paths loop
      if btrim(v_path) <> '' then
        insert into public.media (submission_id, bucket, path, mime, size, status)
        values (v_submission_id, 'pending-media', v_path, 'application/octet-stream', 0, 'pending');
      end if;
    end loop;
  end if;

  return 'PL-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
end;
$$;

grant execute on function public.submit_report(
  text, text, text, uuid, text, double precision, double precision,
  text, date, text, text, boolean, text[]
) to anon, authenticated;

-- Aggiunge "cura" alle categorie attive esistenti (seed gia applicato in prod).
update public.categories
  set types = array_append(types, 'cura')
  where active and not ('cura' = any(types));

-- 0001 — Estensioni, tipi e tabelle di base.
-- Prima i luoghi (MVP). Da applicare a Supabase con un'operazione separata dal
-- deploy del frontend (vedi sezione K del piano). Idempotente ove possibile.

-- PostGIS per la geometria dei punti.
create extension if not exists postgis;
-- pgcrypto per gen_random_uuid().
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- categories: configurazione pubblica delle categorie (max 6 attive nell'MVP).
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id     uuid primary key default gen_random_uuid(),
  slug   text not null unique,
  label  text not null,
  color  text not null default '#5f6b66',
  icon   text,
  types  text[] not null default array['criticita','risorsa','proposta'],
  active boolean not null default true,
  sort   integer not null default 0
);

-- ---------------------------------------------------------------------------
-- places: schede pubblicate. Unica entità realmente pubblica.
-- ---------------------------------------------------------------------------
create table if not exists public.places (
  id                   uuid primary key default gen_random_uuid(),
  title                text not null,
  summary              text,
  description          text,
  type                 text not null check (type in ('criticita','risorsa','proposta')),
  category_id          uuid not null references public.categories(id),
  proposal             text,
  public_status        text not null default 'segnalato'
                         check (public_status in ('segnalato','inviato_al_comune','risolto')),
  geom                 geography(Point, 4326) not null,
  location_label       text,
  first_observed       date,
  published_at         timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  source_submission_id uuid
);

create index if not exists places_geom_gix on public.places using gist (geom);
create index if not exists places_category_idx on public.places (category_id);
create index if not exists places_type_idx on public.places (type);
create index if not exists places_status_idx on public.places (public_status);

-- ---------------------------------------------------------------------------
-- submissions: segnalazioni grezze in ingresso. Privato.
-- ---------------------------------------------------------------------------
create table if not exists public.submissions (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  description     text not null,
  type            text not null check (type in ('criticita','risorsa','proposta')),
  category_id     uuid not null references public.categories(id),
  proposal        text,
  geom            geography(Point, 4326) not null,
  location_label  text,
  first_observed  date,
  internal_status text not null default 'ricevuta'
                    check (internal_status in ('ricevuta','pubblicata','respinta')),
  reject_reason   text,
  created_at      timestamptz not null default now(),
  moderated_at    timestamptz,
  moderator_id    uuid references auth.users(id),
  honeypot        text
);

create index if not exists submissions_status_idx on public.submissions (internal_status);
create index if not exists submissions_created_idx on public.submissions (created_at desc);

-- places.source_submission_id -> submissions.id (aggiunto dopo la creazione).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'places_source_submission_fk'
  ) then
    alter table public.places
      add constraint places_source_submission_fk
      foreign key (source_submission_id) references public.submissions(id);
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- submitter_contacts: contatti separati dal contenuto territoriale. Privato.
-- ---------------------------------------------------------------------------
create table if not exists public.submitter_contacts (
  submission_id uuid primary key references public.submissions(id) on delete cascade,
  email         text not null,
  consent       boolean not null default false,
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- media: riferimenti alle foto (max 3 per submission). Bucket + stato.
-- ---------------------------------------------------------------------------
create table if not exists public.media (
  id            uuid primary key default gen_random_uuid(),
  submission_id uuid references public.submissions(id) on delete cascade,
  place_id      uuid references public.places(id) on delete set null,
  bucket        text not null check (bucket in ('pending-media','public-media')),
  path          text not null,
  mime          text not null,
  size          integer not null,
  width         integer,
  height        integer,
  status        text not null default 'pending'
                  check (status in ('pending','approved','rejected')),
  caption       text,
  created_at    timestamptz not null default now()
);

create index if not exists media_submission_idx on public.media (submission_id);
create index if not exists media_place_idx on public.media (place_id);
create index if not exists media_status_idx on public.media (status);

-- ---------------------------------------------------------------------------
-- place_updates: storico dei cambi di stato pubblico. Storico pubblico.
-- ---------------------------------------------------------------------------
create table if not exists public.place_updates (
  id           uuid primary key default gen_random_uuid(),
  place_id     uuid not null references public.places(id) on delete cascade,
  old_status   text,
  new_status   text not null,
  note         text,
  moderator_id uuid not null references auth.users(id),
  created_at   timestamptz not null default now()
);

create index if not exists place_updates_place_idx on public.place_updates (place_id, created_at);

-- ---------------------------------------------------------------------------
-- profiles: profili autorizzativi dei moderatori (mappa su auth.users).
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  role         text not null default 'moderator' check (role in ('moderator','admin')),
  display_name text,
  active       boolean not null default true
);

-- ---------------------------------------------------------------------------
-- moderation_log: audit essenziale delle operazioni di moderazione.
-- ---------------------------------------------------------------------------
create table if not exists public.moderation_log (
  id           uuid primary key default gen_random_uuid(),
  moderator_id uuid not null references auth.users(id),
  action       text not null,
  entity_type  text not null,
  entity_id    uuid not null,
  detail       jsonb,
  created_at   timestamptz not null default now()
);

create index if not exists moderation_log_created_idx on public.moderation_log (created_at desc);
create index if not exists moderation_log_entity_idx on public.moderation_log (entity_id);

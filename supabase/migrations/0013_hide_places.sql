-- 0013 — Visibilità delle schede: colonna `hidden` per nascondere una scheda
-- dalla mappa pubblica senza cancellarla. I moderatori vedono comunque tutto.

alter table public.places
  add column if not exists hidden boolean not null default false;

create index if not exists places_hidden_idx on public.places (hidden);

-- La lettura pubblica non deve esporre le schede nascoste.
drop policy if exists places_select_public on public.places;
create policy places_select_public on public.places
  for select to anon, authenticated
  using (hidden = false);

-- La vista pubblica filtra esplicitamente le schede nascoste (belt-and-suspenders):
-- così la mappa non le mostra nemmeno a un moderatore autenticato.
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
from public.places p
where p.hidden = false;

grant select on public.places_public to anon, authenticated;

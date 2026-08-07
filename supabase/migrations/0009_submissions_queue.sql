-- 0009 — Vista della coda di moderazione con coordinate (lng/lat).
-- security_invoker: eredita la RLS di `submissions` (solo moderatori la leggono).

create or replace view public.submissions_queue
with (security_invoker = true) as
select
  s.id,
  s.title,
  s.description,
  s.type,
  s.category_id,
  s.proposal,
  s.location_label,
  s.internal_status,
  s.created_at,
  st_x(s.geom::geometry) as lng,
  st_y(s.geom::geometry) as lat
from public.submissions s;

grant select on public.submissions_queue to authenticated;

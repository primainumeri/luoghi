-- 0011 — "Patrimonio storico e bellezza urbana" disponibile anche per le criticità.
-- Il seed 0006 usa "on conflict do nothing": aggiorno la riga già presente in prod.

update public.categories
  set types = array_append(types, 'criticita')
  where slug = 'patrimonio-bellezza' and not ('criticita' = any (types));

-- 0006 — Seed categorie iniziali (dati di configurazione, non personali).
-- Applicato come migration così `supabase db push` lo esegue insieme alle altre.
-- Idempotente: non sovrascrive categorie già presenti (match per slug).

insert into public.categories (slug, label, color, types, active, sort) values
  ('acqua-fognature',    'Acqua, fognature e depurazione',        '#2a5d8f', array['criticita','proposta','cura'],           true, 10),
  ('strade-mobilita',    'Strade, marciapiedi e mobilità',        '#7a5a2f', array['criticita','proposta','cura'],           true, 20),
  ('verde-alberature',   'Verde pubblico e alberature',           '#2f7a3f', array['criticita','risorsa','proposta','cura'], true, 30),
  ('rifiuti-decoro',     'Rifiuti, pulizia e decoro',             '#8f5a2a', array['criticita','proposta','cura'],           true, 40),
  ('costa-ambiente',     'Costa, spiagge e ambiente marino',      '#1f6f8f', array['criticita','risorsa','proposta','cura'], true, 50),
  ('patrimonio-bellezza','Patrimonio storico e bellezza urbana',  '#6a2f7a', array['risorsa','proposta','cura'],             true, 60)
on conflict (slug) do nothing;

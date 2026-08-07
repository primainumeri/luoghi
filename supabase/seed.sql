-- seed.sql — Dati iniziali NON personali.
-- Categorie iniziali (max 6 attive nell'MVP). Le categorie sono configurabili
-- senza modifiche al codice. Le schede curate (10-15) vanno inserite a parte
-- dal gruppo editoriale tramite l'area di moderazione (contenuti approvati).

insert into public.categories (slug, label, color, types, active, sort) values
  ('acqua-fognature',   'Acqua, fognature e depurazione',        '#2a5d8f', array['criticita','proposta'],            true, 10),
  ('strade-mobilita',   'Strade, marciapiedi e mobilità',        '#7a5a2f', array['criticita','proposta'],            true, 20),
  ('verde-alberature',  'Verde pubblico e alberature',           '#2f7a3f', array['criticita','risorsa','proposta'],  true, 30),
  ('rifiuti-decoro',    'Rifiuti, pulizia e decoro',             '#8f5a2a', array['criticita','proposta'],            true, 40),
  ('costa-ambiente',    'Costa, spiagge e ambiente marino',      '#1f6f8f', array['criticita','risorsa','proposta'],  true, 50),
  ('patrimonio-bellezza','Patrimonio storico e bellezza urbana', '#6a2f7a', array['risorsa','proposta'],              true, 60)
on conflict (slug) do nothing;

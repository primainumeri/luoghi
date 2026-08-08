-- 0012 — Nuovo set di categorie tematiche (aggiorna le righe esistenti per slug,
-- preservando gli id già referenziati da places/submissions).
-- Idempotente: alla seconda esecuzione i vecchi slug non esistono più (no-op).

update public.categories set
  slug  = 'acqua-natura-ambiente',
  label = 'Acqua, natura e ambiente',
  color = '#1f6f8f',
  types = array['criticita', 'risorsa', 'proposta', 'cura']
  where slug = 'acqua-fognature';

update public.categories set
  slug  = 'mobilita-accessibilita',
  label = 'Mobilità e accessibilità',
  color = '#2a5d8f',
  types = array['criticita', 'risorsa', 'proposta', 'cura']
  where slug = 'strade-mobilita';

update public.categories set
  slug  = 'spazi-pubblici-territorio',
  label = 'Spazi pubblici e territorio costruito',
  color = '#6a7a3f',
  types = array['criticita', 'risorsa', 'proposta', 'cura']
  where slug = 'verde-alberature';

update public.categories set
  slug  = 'pulizia-decoro',
  label = 'Pulizia e decoro',
  color = '#8f5a2a',
  types = array['criticita', 'risorsa', 'proposta', 'cura']
  where slug = 'rifiuti-decoro';

update public.categories set
  slug  = 'servizi-vita-comunitaria',
  label = 'Servizi e vita comunitaria',
  color = '#c56a2c',
  types = array['criticita', 'risorsa', 'proposta', 'cura']
  where slug = 'costa-ambiente';

update public.categories set
  slug  = 'attivita-identita',
  label = 'Attività e identità del territorio',
  color = '#6a2f7a',
  types = array['criticita', 'risorsa', 'proposta', 'cura']
  where slug = 'patrimonio-bellezza';

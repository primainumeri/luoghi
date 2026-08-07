-- 0005 — Funzioni di moderazione (autenticate). Ogni funzione verifica
-- is_moderator() ed è SECURITY DEFINER per scrivere audit + transizioni in modo
-- atomico. Le foto vengono promosse a parte dalla Edge Function promote-media.

-- reject_submission: marca una segnalazione come respinta con motivazione.
create or replace function public.reject_submission(
  p_submission_id uuid,
  p_reason        text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_moderator() then
    raise exception 'Non autorizzato';
  end if;
  if coalesce(btrim(p_reason), '') = '' then
    raise exception 'Motivazione obbligatoria';
  end if;

  update public.submissions
    set internal_status = 'respinta',
        reject_reason   = btrim(p_reason),
        moderated_at    = now(),
        moderator_id    = auth.uid()
    where id = p_submission_id and internal_status = 'ricevuta';

  if not found then
    raise exception 'Segnalazione non trovata o già trattata';
  end if;

  insert into public.moderation_log (moderator_id, action, entity_type, entity_id, detail)
  values (auth.uid(), 'reject', 'submission', p_submission_id,
          jsonb_build_object('reason', btrim(p_reason)));
end;
$$;

-- publish_submission: crea una scheda pubblica da una segnalazione e la marca
-- come pubblicata. Le foto approvate vengono collegate al place e promosse a
-- parte via Edge Function. Restituisce l'id del place creato.
create or replace function public.publish_submission(
  p_submission_id uuid,
  p_title         text,
  p_summary       text,
  p_description   text,
  p_proposal      text,
  p_public_status text default 'segnalato'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sub    public.submissions%rowtype;
  v_place_id uuid;
begin
  if not public.is_moderator() then
    raise exception 'Non autorizzato';
  end if;
  if p_public_status not in ('segnalato','inviato_al_comune','risolto') then
    raise exception 'Stato pubblico non valido';
  end if;

  select * into v_sub from public.submissions
    where id = p_submission_id and internal_status = 'ricevuta';
  if not found then
    raise exception 'Segnalazione non trovata o già trattata';
  end if;

  insert into public.places (
    title, summary, description, type, category_id, proposal,
    public_status, geom, location_label, first_observed, source_submission_id
  ) values (
    coalesce(nullif(btrim(p_title), ''), v_sub.title),
    nullif(btrim(p_summary), ''),
    coalesce(nullif(btrim(p_description), ''), v_sub.description),
    v_sub.type, v_sub.category_id, nullif(btrim(p_proposal), ''),
    p_public_status, v_sub.geom, v_sub.location_label, v_sub.first_observed, v_sub.id
  )
  returning id into v_place_id;

  update public.submissions
    set internal_status = 'pubblicata', moderated_at = now(), moderator_id = auth.uid()
    where id = p_submission_id;

  -- Collega al place le foto approvate della segnalazione.
  update public.media
    set place_id = v_place_id
    where submission_id = p_submission_id and status = 'approved';

  insert into public.place_updates (place_id, old_status, new_status, note, moderator_id)
  values (v_place_id, null, p_public_status, 'Pubblicazione', auth.uid());

  insert into public.moderation_log (moderator_id, action, entity_type, entity_id, detail)
  values (auth.uid(), 'publish', 'submission', p_submission_id,
          jsonb_build_object('place_id', v_place_id));

  return v_place_id;
end;
$$;

-- set_place_status: aggiorna lo stato pubblico di una scheda con voce storica.
create or replace function public.set_place_status(
  p_place_id uuid,
  p_status   text,
  p_note     text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old text;
begin
  if not public.is_moderator() then
    raise exception 'Non autorizzato';
  end if;
  if p_status not in ('segnalato','inviato_al_comune','risolto') then
    raise exception 'Stato pubblico non valido';
  end if;

  select public_status into v_old from public.places where id = p_place_id;
  if not found then
    raise exception 'Scheda non trovata';
  end if;

  update public.places
    set public_status = p_status, updated_at = now()
    where id = p_place_id;

  insert into public.place_updates (place_id, old_status, new_status, note, moderator_id)
  values (p_place_id, v_old, p_status, nullif(btrim(p_note), ''), auth.uid());

  insert into public.moderation_log (moderator_id, action, entity_type, entity_id, detail)
  values (auth.uid(), 'status_change', 'place', p_place_id,
          jsonb_build_object('from', v_old, 'to', p_status));
end;
$$;

revoke all on function public.reject_submission(uuid, text) from public;
revoke all on function public.publish_submission(uuid, text, text, text, text, text) from public;
revoke all on function public.set_place_status(uuid, text, text) from public;
grant execute on function public.reject_submission(uuid, text) to authenticated;
grant execute on function public.publish_submission(uuid, text, text, text, text, text) to authenticated;
grant execute on function public.set_place_status(uuid, text, text) to authenticated;

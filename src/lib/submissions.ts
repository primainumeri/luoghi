import { supabase } from './supabase';
import type { PlaceType } from './types';

export interface SubmissionInput {
  title: string;
  description: string;
  type: PlaceType;
  categoryId: string;
  proposal?: string;
  lng: number;
  lat: number;
  locationLabel?: string;
  firstObserved?: string;
  email?: string;
  name?: string;
  consent: boolean;
  honeypot?: string;
  // Percorsi delle foto già caricate nel bucket privato `pending-media` (max 3).
  mediaPaths?: string[];
}

// Invia una segnalazione anonima tramite una funzione SECURITY DEFINER lato DB.
// Motivo: sotto RLS l'anonimo può inserire ma NON rileggere le segnalazioni;
// la funzione scrive submission + contatto + media in modo atomico e restituisce
// soltanto un riferimento pubblico opaco (non l'id interno).
export async function submitReport(input: SubmissionInput): Promise<string> {
  // Anti-bot honeypot: se compilato, simuliamo successo senza scrivere nulla.
  if (input.honeypot && input.honeypot.trim() !== '') {
    return 'OK';
  }

  const { data, error } = await supabase.rpc('submit_report', {
    p_title: input.title,
    p_description: input.description,
    p_type: input.type,
    p_category_id: input.categoryId,
    p_proposal: input.proposal ?? null,
    p_lng: input.lng,
    p_lat: input.lat,
    p_location_label: input.locationLabel ?? null,
    p_first_observed: input.firstObserved ?? null,
    p_email: input.email && input.email.trim() !== '' ? input.email.trim() : '',
    p_name: input.name && input.name.trim() !== '' ? input.name.trim() : '',
    p_consent: input.consent,
    p_media_paths: input.mediaPaths ?? [],
  });

  if (error) {
    throw error;
  }
  return data as string;
}

import { supabase } from './supabase';
import type { Place } from './types';

// Legge i luoghi pubblicati dalla vista pubblica `places_public`.
// La vista espone lng/lat al posto della geometria PostGIS e rispetta le RLS.
export async function fetchPublishedPlaces(): Promise<Place[]> {
  const { data, error } = await supabase
    .from('places_public')
    .select(
      'id, title, summary, description, type, category_id, proposal, public_status, lng, lat, location_label, first_observed, published_at, updated_at',
    );

  if (error) {
    throw error;
  }
  return (data ?? []) as Place[];
}

export async function fetchPlaceById(id: string): Promise<Place | null> {
  const { data, error } = await supabase
    .from('places_public')
    .select(
      'id, title, summary, description, type, category_id, proposal, public_status, lng, lat, location_label, first_observed, published_at, updated_at',
    )
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw error;
  }
  return (data as Place | null) ?? null;
}

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

// Foto pubbliche di una scheda: solo media approvati nel bucket public-media.
// La RLS consente la lettura anonima di questi record; il bucket è pubblico.
export async function fetchPlaceMedia(placeId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('media')
    .select('path, created_at')
    .eq('place_id', placeId)
    .eq('bucket', 'public-media')
    .eq('status', 'approved')
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }
  return (data ?? []).map(
    (m) =>
      supabase.storage.from('public-media').getPublicUrl(m.path).data.publicUrl,
  );
}

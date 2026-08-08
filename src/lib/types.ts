// Tipi condivisi del dominio applicativo (MVP).

export type PlaceType = 'criticita' | 'risorsa' | 'proposta' | 'cura';

export type PublicStatus = 'segnalato' | 'inviato_al_comune' | 'risolto';

export type InternalStatus = 'ricevuta' | 'pubblicata' | 'respinta';

export interface Category {
  id: string;
  slug: string;
  label: string;
  color: string;
  icon: string | null;
  types: PlaceType[];
  active: boolean;
  sort: number;
}

export interface Place {
  id: string;
  title: string;
  summary: string | null;
  description: string | null;
  type: PlaceType;
  category_id: string;
  proposal: string | null;
  public_status: PublicStatus;
  lng: number;
  lat: number;
  location_label: string | null;
  first_observed: string | null;
  published_at: string;
  updated_at: string;
}

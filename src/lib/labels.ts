import type { PlaceType, PublicStatus } from './types';

export const PLACE_TYPE_LABELS: Record<PlaceType, string> = {
  criticita: 'Criticità',
  risorsa: 'Risorsa',
  proposta: 'Proposta',
};

export const PUBLIC_STATUS_LABELS: Record<PublicStatus, string> = {
  segnalato: 'Segnalato',
  inviato_al_comune: 'Inviato al Comune',
  risolto: 'Risolto',
};

// Colore del marker per tipologia. Il colore non è l'unico indicatore:
// la scheda riporta sempre anche l'etichetta testuale (requisito WCAG).
export const PLACE_TYPE_COLORS: Record<PlaceType, string> = {
  criticita: '#a3341f',
  risorsa: '#1f6f5c',
  proposta: '#2a5d8f',
};

export function isPlaceType(value: string): value is PlaceType {
  return value === 'criticita' || value === 'risorsa' || value === 'proposta';
}

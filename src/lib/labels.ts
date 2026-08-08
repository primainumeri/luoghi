import type { PlaceType, PublicStatus } from './types';

export const PLACE_TYPE_LABELS: Record<PlaceType, string> = {
  criticita: 'Criticità',
  risorsa: 'Luoghi da custodire',
  proposta: 'Proposte',
  cura: 'Cura in azione',
};

// Icona per tipologia: usata sia nel selettore di segnalazione sia sui marker della mappa.
export const PLACE_TYPE_ICONS: Record<PlaceType, string> = {
  criticita: '⚠️',
  risorsa: '🛡️',
  proposta: '💡',
  cura: '🌱',
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
  cura: '#b7791f',
};

export function isPlaceType(value: string): value is PlaceType {
  return (
    value === 'criticita' ||
    value === 'risorsa' ||
    value === 'proposta' ||
    value === 'cura'
  );
}

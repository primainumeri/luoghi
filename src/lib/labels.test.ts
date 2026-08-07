import { describe, it, expect } from 'vitest';
import {
  PLACE_TYPE_LABELS,
  PUBLIC_STATUS_LABELS,
  isPlaceType,
} from '@/lib/labels';

describe('labels', () => {
  it('mappa le tre tipologie ammesse', () => {
    expect(PLACE_TYPE_LABELS.criticita).toBe('Criticità');
    expect(PLACE_TYPE_LABELS.risorsa).toBe('Risorsa');
    expect(PLACE_TYPE_LABELS.proposta).toBe('Proposta');
  });

  it('mappa i tre stati pubblici', () => {
    expect(PUBLIC_STATUS_LABELS.segnalato).toBe('Segnalato');
    expect(PUBLIC_STATUS_LABELS.inviato_al_comune).toBe('Inviato al Comune');
    expect(PUBLIC_STATUS_LABELS.risolto).toBe('Risolto');
  });

  it('riconosce solo i tipi validi', () => {
    expect(isPlaceType('criticita')).toBe(true);
    expect(isPlaceType('intervento')).toBe(false);
    expect(isPlaceType('')).toBe(false);
  });
});

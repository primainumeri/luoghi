// Rileva i dispositivi mobili: la segnalazione (fotocamera + posizione) è
// abilitata solo su mobile; su desktop l'app è di sola consultazione.
export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const uaMobile = /Android|iPhone|iPad|iPod|Mobile|Opera Mini|IEMobile|BlackBerry/i.test(ua);
  const coarsePointer =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(pointer: coarse)').matches;
  const touch = navigator.maxTouchPoints > 0;
  return uaMobile || (coarsePointer && touch);
}

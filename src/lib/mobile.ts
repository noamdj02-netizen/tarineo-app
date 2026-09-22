/** Détection mobile côté client (User-Agent). */
export function estAppareilMobile(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

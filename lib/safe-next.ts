/** N'accepte que des chemins internes (« /projets »), jamais « //site.com » ni une URL. */
export function safeNext(next: string | null | undefined, fallback = "/projets") {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return fallback;
  }
  return next;
}

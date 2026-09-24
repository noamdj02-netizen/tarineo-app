// Service worker Navpit.
// - Fichiers de build (/_next/static), icônes, polices : cache d'abord (ils ne changent jamais d'URL).
// - Pages : réseau d'abord, copie en cache pour les rouvrir hors ligne.
// - Jamais de cache pour l'API, l'authentification, ni les requêtes vers d'autres domaines (Supabase, Claude).
const VERSION = "navpit-v3";
const STATIC = `${VERSION}-static`;
const PAGES = `${VERSION}-pages`;

const OFFLINE_HTML = `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>Hors ligne · Navpit</title>
<style>body{margin:0;min-height:100dvh;display:grid;place-items:center;background:#f3f3f2;color:#111;font:16px/1.5 system-ui,sans-serif;padding:24px;text-align:center}
b{display:block;font-size:22px;margin-bottom:6px}button{margin-top:16px;min-height:44px;padding:0 20px;border:0;border-radius:999px;background:#111;color:#fff;font:600 15px system-ui}</style>
</head><body><div><b>Pas de connexion</b>Cette page n’a pas encore été ouverte sur ce téléphone.<br>
<button onclick="location.reload()">Réessayer</button></div></body></html>`;

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

function isStatic(url) {
  return url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/");
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth/")) return;

  if (isStatic(url)) {
    event.respondWith(
      caches.open(STATIC).then(async (cache) => {
        const hit = await cache.match(request);
        if (hit) return hit;
        const res = await fetch(request);
        if (res.ok) cache.put(request, res.clone());
        return res;
      }),
    );
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        const cache = await caches.open(PAGES);
        try {
          const res = await fetch(request);
          if (new URL(res.url).pathname === "/login") {
            // déconnecté : on efface les pages gardées pour le hors-ligne
            await caches.delete(PAGES);
          } else if (res.ok && !res.redirected) {
            cache.put(request, res.clone());
          }
          return res;
        } catch {
          return (
            (await cache.match(request)) ||
            new Response(OFFLINE_HTML, { headers: { "Content-Type": "text/html; charset=utf-8" } })
          );
        }
      })(),
    );
  }
});

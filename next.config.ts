import type { NextConfig } from "next";
import path from "path";

const supabaseHostname = process.env.SUPABASE_URL
  ? new URL(process.env.SUPABASE_URL).hostname
  : null;

const nextConfig: NextConfig = {
  // Évite que Turbopack fige un @prisma/client périmé dans les chunks serveur après
  // `prisma generate` — sans ça, les nouveaux champs User (importEmailToken, etc.)
  // provoquent des PrismaClientValidationError jusqu'au redémarrage complet.
  serverExternalPackages: ["@prisma/client", "prisma"],
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Autorise l'accès au serveur dev depuis le réseau local (tests sur téléphone).
  // Sans ça, Next.js bloque silencieusement les ressources JS/HMR pour les requêtes
  // dont l'origine n'est pas localhost — la page s'affiche mais React n'hydrate jamais,
  // donc aucun clic ne répond (aucune erreur visible côté navigateur).
  allowedDevOrigins: ["172.6.200.227", "127.0.0.1", "localhost"],
  images: {
    // Logos des enseignes (voir src/lib/fournisseursConnus.ts). Passer par next/image
    // plutôt que par une balise <img> a deux avantages ici : le téléchargement se fait
    // depuis notre serveur, donc logo.dev ne voit jamais l'IP de l'artisan, et le
    // résultat est mis en cache au lieu d'être rechargé à chaque affichage.
    remotePatterns: [
      { protocol: "https", hostname: "img.logo.dev" },
      ...(supabaseHostname
        ? [{ protocol: "https" as const, hostname: supabaseHostname, pathname: "/storage/v1/object/sign/**" }]
        : []),
    ],
  },
  experimental: {
    serverActions: {
      // La limite par défaut (1 Mo) est trop faible pour des photos de devis/factures.
      bodySizeLimit: "20mb",
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Force HTTPS côté navigateur (Vercel termine déjà TLS ; HSTS empêche le
          // retour en HTTP après la première visite HTTPS).
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https://api.stripe.com https://*.supabase.co https://vitals.vercel-insights.com https://va.vercel-scripts.com; frame-src https://js.stripe.com https://hooks.stripe.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

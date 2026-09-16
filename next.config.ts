import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Autorise l'accès au serveur dev depuis le réseau local (tests sur téléphone).
  // Sans ça, Next.js bloque silencieusement les ressources JS/HMR pour les requêtes
  // dont l'origine n'est pas localhost — la page s'affiche mais React n'hydrate jamais,
  // donc aucun clic ne répond (aucune erreur visible côté navigateur).
  allowedDevOrigins: ["172.6.200.227"],
  images: {
    // Logos des enseignes (voir src/lib/fournisseursConnus.ts). Passer par next/image
    // plutôt que par une balise <img> a deux avantages ici : le téléchargement se fait
    // depuis notre serveur, donc logo.dev ne voit jamais l'IP de l'artisan, et le
    // résultat est mis en cache au lieu d'être rechargé à chaque affichage.
    remotePatterns: [{ protocol: "https", hostname: "img.logo.dev" }],
  },
  experimental: {
    serverActions: {
      // La limite par défaut (1 Mo) est trop faible pour des photos de devis/factures.
      bodySizeLimit: "20mb",
    },
  },
};

export default nextConfig;

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
  experimental: {
    serverActions: {
      // La limite par défaut (1 Mo) est trop faible pour des photos de devis/factures.
      bodySizeLimit: "20mb",
    },
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `npm run dev` écrit dans .next-dev : un `npm run build` en parallèle ne casse plus le serveur de dev
  distDir: process.env.NEXT_DIST_DIR || ".next",
  async redirects() {
    return [
      // l'ancien onglet « Figma → Cursor » vit maintenant en bas de la page Outils
      { source: "/workflow", destination: "/schemas", permanent: false },
    ];
  },
};

export default nextConfig;

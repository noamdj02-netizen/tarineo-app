import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

/** Racine du repo (évite que Next prenne ~/ à cause d’un autre package-lock.json). */
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // `npm run dev` écrit dans .next-dev : un `npm run build` en parallèle ne casse plus le serveur de dev
  distDir: process.env.NEXT_DIST_DIR || ".next",
  outputFileTracingRoot: projectRoot,
  serverActions: {
    bodySizeLimit: "3mb",
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "img.logo.dev", pathname: "/**" }],
  },
  async redirects() {
    return [
      // l'ancien onglet « Figma → Cursor » vit maintenant en bas de la page Outils
      { source: "/workflow", destination: "/schemas", permanent: false },
      { source: "/cgu", destination: "/cgv", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;

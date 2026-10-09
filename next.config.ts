import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

/** Racine du repo (évite que Next prenne ~/ à cause d’un autre package-lock.json). */
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // `npm run dev` écrit dans .next-dev : un `npm run build` en parallèle ne casse plus le serveur de dev
  distDir: process.env.NEXT_DIST_DIR || ".next",
  outputFileTracingRoot: projectRoot,
  serverExternalPackages: ["@react-pdf/renderer", "@react-pdf/hyphenate"],
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
    /** Démo landing : upload jusqu’à 15 Mo avec middleware Supabase (défaut Next = 10 Mo). */
    middlewareClientMaxBodySize: "16mb",
    serverActions: {
      bodySizeLimit: "3mb",
    },
  },
  turbopack: {
    resolveAlias: {
      "@react-pdf/hyphenate/en-us": path.join(
        projectRoot,
        "node_modules/@react-pdf/hyphenate/lib/en-us.js",
      ),
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@react-pdf/hyphenate/en-us": path.join(projectRoot, "node_modules/@react-pdf/hyphenate/lib/en-us.js"),
    };
    return config;
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "img.logo.dev", pathname: "/**" }],
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "navpit.com" }],
        destination: "https://www.navpit.com/:path*",
        permanent: true,
      },
      // l'ancien onglet « Figma → Cursor » vit maintenant en bas de la page Outils
      { source: "/workflow", destination: "/hausses", permanent: false },
      { source: "/projets", destination: "/chantiers", permanent: false },
      { source: "/projets/:slug", destination: "/chantiers/:slug", permanent: false },
      { source: "/ressources", destination: "/distributeur", permanent: false },
      { source: "/composants", destination: "/client", permanent: false },
      { source: "/composants-2", destination: "/client", permanent: false },
      { source: "/schemas", destination: "/hausses", permanent: false },
      { source: "/audit", destination: "/comparateur", permanent: false },
      { source: "/outils", destination: "/fournisseurs", permanent: false },
      { source: "/anatomie", destination: "/achats", permanent: false },
      { source: "/cgu", destination: "/cgv", permanent: true },
      { source: "/themes", destination: "/accueil", permanent: false },
      { source: "/themes/:path*", destination: "/accueil", permanent: false },
      { source: "/bibliotheque", destination: "/accueil", permanent: false },
      { source: "/bibliotheque/:path*", destination: "/accueil", permanent: false },
      { source: "/automatisations", destination: "/accueil", permanent: false },
      { source: "/assistant", destination: "/accueil", permanent: false },
      { source: "/schemas/:id", destination: "/hausses", permanent: false },
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

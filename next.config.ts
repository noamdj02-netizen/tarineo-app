import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `npm run dev` écrit dans .next-dev : un `npm run build` en parallèle ne casse plus le serveur de dev
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;

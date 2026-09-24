import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND.name,
    short_name: BRAND.name,
    description: BRAND.description,
    lang: "fr",
    start_url: "/accueil",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    // même valeur que --color-bg (globals.css)
    background_color: "#f3f3f2",
    theme_color: "#f3f3f2",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Projets", url: "/projets" },
      { name: "Assistant IA", url: "/assistant" },
    ],
  };
}

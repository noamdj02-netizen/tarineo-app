import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tarineo",
    short_name: "Tarineo",
    description: "Comparez vos devis fournisseurs à votre historique d'achats.",
    start_url: "/accueil",
    display: "standalone",
    background_color: "#f6f7f9",
    theme_color: "#EC5821",
    orientation: "portrait",
    icons: [
      {
        src: "/landing/logo-icon.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/landing/logo-icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

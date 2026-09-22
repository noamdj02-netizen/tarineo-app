import type { Metadata } from "next";
import { NotFoundPage } from "./_components/NotFoundPage";

export const metadata: Metadata = {
  title: "Page introuvable | Tarineo",
  description: "Cette page n'existe pas ou a été déplacée.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return <NotFoundPage />;
}

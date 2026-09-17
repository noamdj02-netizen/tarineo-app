import { notFound } from "next/navigation";

/** Outils dev (aperçu emails) — indisponibles en production. */
export default function LayoutDev({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }
  return children;
}

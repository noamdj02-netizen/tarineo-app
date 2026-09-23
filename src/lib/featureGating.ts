import { notFound } from "next/navigation";
import { NextResponse } from "next/server";

/** Bloque une page App Router quand la fonctionnalité est désactivée. */
export function exigerFeature(actif: boolean): void {
  if (!actif) notFound();
}

/** Réponse 404 pour une route API dont la fonctionnalité est désactivée. */
export function reponseApiFeatureDesactivee(): NextResponse {
  return NextResponse.json({ erreur: "Introuvable" }, { status: 404 });
}

import { notFound } from "next/navigation";
import { NextResponse } from "next/server";

export function exigerFeature(actif: boolean): void {
  if (!actif) notFound();
}

export function reponseApiFeatureDesactivee(): NextResponse {
  return NextResponse.json({ erreur: "Introuvable" }, { status: 404 });
}

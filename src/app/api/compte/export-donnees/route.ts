import JSZip from "jszip";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { exporterDonneesUtilisateur } from "@/lib/exportDonnees";
import { ipDepuisRequete, verifierRateLimit } from "@/lib/rateLimit";

export async function GET(request: Request) {
  const format = new URL(request.url).searchParams.get("format") ?? "json";
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });
  }

  const ip = ipDepuisRequete(request.headers);
  if (!verifierRateLimit(`export:${session.user.id}:${ip}`, 3, 60 * 60 * 1000)) {
    return NextResponse.json({ erreur: "Trop de demandes d'export. Réessayez plus tard." }, { status: 429 });
  }

  const donnees = await exporterDonneesUtilisateur(session.user.id);
  const date = new Date().toISOString().slice(0, 10);

  if (format === "zip") {
    const zip = new JSZip();
    zip.file("donnees.json", JSON.stringify(donnees, null, 2));
    zip.file(
      "readme.txt",
      "Export Tarineo (RGPD). Les fichiers PDF originaux restent dans votre espace tant que le compte est actif.",
    );
    const buffer = await zip.generateAsync({ type: "nodebuffer" });
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="tarineo-export-${date}.zip"`,
      },
    });
  }

  return new NextResponse(JSON.stringify(donnees, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="tarineo-export-${date}.json"`,
    },
  });
}

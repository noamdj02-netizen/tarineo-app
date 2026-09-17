import fs from "node:fs";
import path from "node:path";

type PieceJointeInline = {
  filename: string;
  content: Buffer;
  contentId: string;
};

const RACINE_PUBLIC = path.join(process.cwd(), "public");

function contentIdDepuisChemin(cheminRelatif: string): string {
  return `tarineo-${cheminRelatif.replace(/^\//, "").replace(/[/.]/g, "-")}`;
}

function mimeDepuisNom(fichier: string): string {
  if (fichier.endsWith(".svg")) return "image/svg+xml";
  if (fichier.endsWith(".png")) return "image/png";
  if (fichier.endsWith(".jpg") || fichier.endsWith(".jpeg")) return "image/jpeg";
  return "application/octet-stream";
}

/**
 * Remplace les URLs d'images `/emails/...` par des références CID et attache
 * les fichiers depuis `public/`. Indispensable en dev (localhost inaccessible
 * depuis les clients mail) et fiable en production.
 */
export function inlinerImagesEmail(html: string): {
  html: string;
  attachments: PieceJointeInline[];
} {
  const urls = new Set<string>();
  const regex = /src="([^"]*\/emails\/[^"?#]+)"/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    urls.add(match[1]);
  }

  const attachments: PieceJointeInline[] = [];
  const cidsParChemin = new Map<string, string>();
  let resultat = html;

  for (const url of urls) {
    const extrait = url.match(/\/emails\/([^"?#]+)/);
    if (!extrait) continue;

    const cheminRelatif = `/emails/${extrait[1]}`;
    let contentId = cidsParChemin.get(cheminRelatif);

    if (!contentId) {
      const fichierLocal = path.join(RACINE_PUBLIC, cheminRelatif);
      if (!fs.existsSync(fichierLocal)) {
        console.warn(`[email] Asset manquant : ${fichierLocal}`);
        continue;
      }

      contentId = contentIdDepuisChemin(cheminRelatif);
      cidsParChemin.set(cheminRelatif, contentId);
      attachments.push({
        filename: path.basename(cheminRelatif),
        content: fs.readFileSync(fichierLocal),
        contentId,
      });
    }

    const cheminEchappe = cheminRelatif.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    resultat = resultat.replace(new RegExp(`src="[^"]*${cheminEchappe}"`, "g"), `src="cid:${contentId}"`);
  }

  return { html: resultat, attachments };
}

export { mimeDepuisNom };

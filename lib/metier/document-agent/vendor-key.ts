import { KNOWN_SUPPLIERS } from "@/lib/metier/suppliers";

const ALIASES: Record<string, string> = {
  cedeo: "cedeo",
  "point.p": "point_p",
  "point p": "point_p",
  pointp: "point_p",
  "point-p": "point_p",
  rexel: "rexel",
  tereva: "tereva",
  brossette: "brossette",
  richardson: "richardson",
  aubade: "aubade",
  zima: "zima",
  marlin: "marlin",
  descours: "descours",
  "descours & cabaud": "descours",
  "descours cabaud": "descours",
  bigmat: "bigmat",
  sfic: "sfic",
  prolians: "prolians",
};

function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9.\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Clé stable d’enseigne à partir du nom lu sur le document ou du nom de fichier. */
export function resolveVendorKey(partyOrFileHint: string, fileName?: string): string {
  const hay = normalizeText(`${partyOrFileHint} ${fileName ?? ""}`);
  if (!hay) return "unknown";

  for (const [alias, key] of Object.entries(ALIASES)) {
    if (hay.includes(alias)) return key;
  }

  for (const s of KNOWN_SUPPLIERS) {
    const norm = normalizeText(s.name);
    if (norm && hay.includes(norm)) return s.vendorKey;
  }

  return "unknown";
}

export function vendorDisplayName(vendorKey: string): string {
  if (vendorKey === "unknown") return "Enseigne non reconnue";
  const fromCatalog = KNOWN_SUPPLIERS.find((s) => s.vendorKey === vendorKey);
  if (fromCatalog) return fromCatalog.name;
  return vendorKey.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

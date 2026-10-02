/**
 * Répertoire fournisseurs / distributeurs BTP (noms officiels + domaines logo.dev).
 * Source unique pour la page Fournisseurs, les logos et l’agent de lecture documents.
 */

export type KnownSupplier = {
  name: string;
  domain: string;
  kind: "distributeur" | "fournisseur";
  /** Clé profil communautaire document-agent */
  vendorKey: string;
};

export const KNOWN_SUPPLIERS: KnownSupplier[] = [
  { name: "Point.P", domain: "pointp.fr", kind: "distributeur", vendorKey: "point_p" },
  { name: "Cedeo", domain: "cedeo.fr", kind: "distributeur", vendorKey: "cedeo" },
  { name: "Rexel", domain: "rexel.fr", kind: "distributeur", vendorKey: "rexel" },
  { name: "Tereva", domain: "tereva.fr", kind: "distributeur", vendorKey: "tereva" },
  { name: "Descours & Cabaud", domain: "descours.fr", kind: "distributeur", vendorKey: "descours" },
  { name: "Brossette", domain: "brossette.fr", kind: "distributeur", vendorKey: "brossette" },
  { name: "Richardson", domain: "richardson.fr", kind: "distributeur", vendorKey: "richardson" },
  { name: "Aubade", domain: "aubade.fr", kind: "distributeur", vendorKey: "aubade" },
  { name: "BigMat", domain: "bigmat.fr", kind: "distributeur", vendorKey: "bigmat" },
  { name: "SFIC", domain: "sfic.fr", kind: "distributeur", vendorKey: "sfic" },
  { name: "Prolians", domain: "prolians.fr", kind: "distributeur", vendorKey: "prolians" },
  { name: "Zima", domain: "zima.fr", kind: "distributeur", vendorKey: "zima" },
  { name: "Marlin", domain: "marlin.fr", kind: "distributeur", vendorKey: "marlin" },
];

const DOMAIN_BY_NAME = Object.fromEntries(KNOWN_SUPPLIERS.map((s) => [s.name, s.domain]));

export function supplierDomains(): Record<string, string> {
  return DOMAIN_BY_NAME;
}

export function supplierByVendorKey(vendorKey: string): KnownSupplier | undefined {
  return KNOWN_SUPPLIERS.find((s) => s.vendorKey === vendorKey);
}

export function displayNameForVendorKey(vendorKey: string): string | undefined {
  return supplierByVendorKey(vendorKey)?.name;
}

/**
 * Idées ancrées sept. 2026.
 * PH : Ami AI, Creem, tiun, Naoma, Clueso, Voiskey.
 * YC W26 : Bidflow (devis élec), Patientdesk (dentaire).
 * Marché : standard vocal métier, visibilité IA, AO.
 */
export const TREND_APPS = [
  {
    id: "sdr",
    n: "SDR sortant",
    tag: "Vente",
    pitch: "Qui écrire cette semaine. La liste, puis l’envoi.",
  },
  {
    id: "usage",
    n: "Facture à l’usage",
    tag: "Paiement",
    pitch: "Auth, Stripe, tokens. Vendre le jour où tu codes.",
  },
  {
    id: "demo",
    n: "Démo 24/7",
    tag: "B2B",
    pitch: "Un agent clique le produit. Le call, après.",
  },
  {
    id: "clip",
    n: "Vidéo depuis l’écran",
    tag: "Produit",
    pitch: "Un enregistrement. Une vidéo. Un article.",
  },
  {
    id: "voix",
    n: "Dictée qui sonne juste",
    tag: "Prod",
    pitch: "Tu parles. Ça arrive écrit pour le bon canal.",
  },
  {
    id: "standard",
    n: "Standard d’un métier",
    tag: "Local",
    pitch: "Le téléphone d’un plombier. Pas un standard pour tous.",
  },
  {
    id: "geo",
    n: "Mentions ChatGPT",
    tag: "SEO",
    pitch: "Où tu apparais dans les réponses IA.",
  },
  {
    id: "devis",
    n: "Devis électricien",
    tag: "Chantier",
    pitch: "Un plan. Un devis. Pas un tableur le soir.",
  },
  {
    id: "dentaire",
    n: "Accueil dentaire",
    tag: "Santé",
    pitch: "RDV, relances, secrétariat d’un cabinet.",
  },
  {
    id: "ao",
    n: "Réponse à un AO",
    tag: "B2B",
    pitch: "L’appel d’offres entre. La proposition sort.",
  },
] as const;

export type TrendAppId = (typeof TREND_APPS)[number]["id"];

export function getTrendApp(id: string) {
  return TREND_APPS.find((a) => a.id === id) ?? null;
}

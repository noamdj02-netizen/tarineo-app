// Garde-fous sur l'extraction IA (coût par appel Claude) et modèle de quotas
// Tarineo. Trois paliers indépendants, vérifiés dans cet ordre :
//
//  1. Import initial (historique) : les N premiers documents envoyés par un
//     compte ne comptent jamais dans le quota mensuel — destinés à importer les
//     devis/factures passés en une fois. One-time (lifetime), pas de limite de
//     durée : simplement épuisé une fois les N documents utilisés. N dépend du
//     statut de paiement : palier fixe pendant l'essai (identique pour tous les
//     plans), ou plafond différencié par plan une fois payé (voir
//     LIMITES_HISTORIQUE_PLAN) — un compte qui paie après avoir déjà entamé son
//     import initial pendant l'essai voit simplement ce plafond s'élargir, sans
//     réinitialiser ce qui a déjà été consommé.
//  2. Quota mensuel : une fois l'import initial épuisé, chaque document envoyé
//     ce mois-ci compte contre un quota mensuel qui dépend lui aussi du statut
//     de paiement — palier fixe pendant l'essai, ou quota du plan réel une fois
//     un moyen de paiement enregistré (User.subscriptionStatus === "active").
//  3. Fin d'essai sans paiement : passé DUREE_ESSAI_MOIS depuis la création du
//     compte, si aucun moyen de paiement n'a été enregistré, l'envoi de nouveaux
//     documents est bloqué entièrement (voir src/app/documents/actions.ts).

export const QUOTAS_PLAN: Record<string, number> = {
  starter: 150,
  pro: 400,
  equipe: 1000,
};

// Palier fixe pendant l'essai gratuit, identique quel que soit le plan visé par
// l'artisan — remplacé par QUOTAS_PLAN[plan] dès le premier moyen de paiement
// enregistré (voir calculerEtatQuota).
export const QUOTA_MENSUEL_ESSAI = 150;

/** Nombre maximal de fichiers sélectionnables en un seul envoi (onboarding / import batch). */
export const MAX_FICHIERS_PAR_LOT = 150;

// Quotas d'import initial différenciés par plan, applicables une fois le premier
// moyen de paiement enregistré (voir LIMITE_HISTORIQUE_ESSAI pour l'essai).
export const LIMITES_HISTORIQUE_PLAN: Record<string, number> = {
  starter: 150,
  pro: 200,
  equipe: 400,
};

// Palier fixe pendant l'essai gratuit, identique quel que soit le plan visé —
// remplacé par LIMITES_HISTORIQUE_PLAN[plan] dès le premier moyen de paiement.
export const LIMITE_HISTORIQUE_ESSAI = 150;

// Durée de l'essai gratuit avant blocage si aucun moyen de paiement n'est enregistré.
export const DUREE_ESSAI_MOIS = 1;

export type EtatQuota =
  | {
      phase: "historique";
      documentsTotal: number;
      limiteHistorique: number;
      documentsRestantsHistorique: number;
    }
  | {
      phase: "mensuel";
      quotaMensuel: number;
      surPlanReel: boolean;
      documentsCeMoisHorsHistorique: number;
      documentsRestantsCeMois: number;
      quotaAtteint: boolean;
    }
  | {
      phase: "bloque_paiement_requis";
      finEssai: Date;
    };

export function debutMoisUTC(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function ajouterMois(date: Date, mois: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + mois, date.getUTCDate()));
}

// --- Quota dédié à la génération de devis clients par IA (voir
// src/lib/genererDevisIA.ts) — délibérément séparé du quota documents ci-dessus : un
// appel Claude texte-vers-lignes coûte de l'ordre de 2 centimes (prompt court en entrée,
// quelques lignes structurées en sortie), sans commune mesure avec l'extraction vision
// d'un document entier qui alimente le quota documents. Un seul palier mensuel, pas de
// palier "historique" (pas de notion d'import initial pour une génération de devis).
export const QUOTAS_DEVIS_IA_PLAN: Record<string, number> = {
  starter: 30,
  pro: 100,
  equipe: 250,
};

// Palier fixe pendant l'essai gratuit, identique quel que soit le plan visé — remplacé
// par QUOTAS_DEVIS_IA_PLAN[plan] dès le premier moyen de paiement enregistré.
export const QUOTA_DEVIS_IA_ESSAI = 10;

export function quotaDevisIA(plan: string | null, subscriptionStatus: string | null): number {
  if (subscriptionStatus === "past_due" || subscriptionStatus === "unpaid") return 0;
  const paye = subscriptionStatus === "active" || subscriptionStatus === "trialing";
  return paye ? (QUOTAS_DEVIS_IA_PLAN[plan ?? ""] ?? QUOTA_DEVIS_IA_ESSAI) : QUOTA_DEVIS_IA_ESSAI;
}

/** Places restantes pour un nouvel envoi (import initial ou quota mensuel). */
export function documentsRestantsEnvoi(etatQuota: EtatQuota): number {
  if (etatQuota.phase === "historique") return etatQuota.documentsRestantsHistorique;
  if (etatQuota.phase === "mensuel") return etatQuota.documentsRestantsCeMois;
  return 0;
}

export function calculerEtatQuota(params: {
  createdAtUtilisateur: Date;
  plan: string | null;
  subscriptionStatus: string | null;
  // Nombre de documents créés avant le début du mois civil courant, et pendant
  // le mois civil courant — comptés séparément pour pouvoir distinguer ce qui
  // relève encore de l'import initial de ce qui relève déjà du quota mensuel
  // (voir le commentaire d'en-tête pour la logique complète).
  documentsAvantCeMois: number;
  documentsCeMois: number;
  maintenant?: Date;
}): EtatQuota {
  const maintenant = params.maintenant ?? new Date();
  const paye = params.subscriptionStatus === "active" || params.subscriptionStatus === "trialing";
  const paiementEnRetard =
    params.subscriptionStatus === "past_due" || params.subscriptionStatus === "unpaid";
  const planPourQuotas = params.plan ?? "starter";

  const finEssai = ajouterMois(params.createdAtUtilisateur, DUREE_ESSAI_MOIS);
  if (paiementEnRetard || (!paye && maintenant >= finEssai)) {
    return { phase: "bloque_paiement_requis", finEssai };
  }

  const limiteHistorique = paye || params.plan
    ? (LIMITES_HISTORIQUE_PLAN[planPourQuotas] ?? LIMITE_HISTORIQUE_ESSAI)
    : LIMITE_HISTORIQUE_ESSAI;

  const documentsTotal = params.documentsAvantCeMois + params.documentsCeMois;

  if (documentsTotal < limiteHistorique) {
    return {
      phase: "historique",
      documentsTotal,
      limiteHistorique,
      documentsRestantsHistorique: limiteHistorique - documentsTotal,
    };
  }

  // Combien de "places" d'import initial restait-il avant le début de ce mois ?
  // Ce qui dépasse, dans les documents de ce mois, relève déjà du quota mensuel.
  const historiqueRestantAvantCeMois = Math.max(0, limiteHistorique - params.documentsAvantCeMois);
  const documentsCeMoisHorsHistorique = Math.max(0, params.documentsCeMois - historiqueRestantAvantCeMois);

  const quotaMensuel =
    paye || params.plan ? (QUOTAS_PLAN[planPourQuotas] ?? QUOTA_MENSUEL_ESSAI) : QUOTA_MENSUEL_ESSAI;

  return {
    phase: "mensuel",
    quotaMensuel,
    surPlanReel: paye,
    documentsCeMoisHorsHistorique,
    documentsRestantsCeMois: Math.max(0, quotaMensuel - documentsCeMoisHorsHistorique),
    quotaAtteint: documentsCeMoisHorsHistorique >= quotaMensuel,
  };
}

/** Charge l'état quota document d'un utilisateur (import initial ou mensuel). */
export async function chargerEtatQuotaUtilisateur(userId: string, maintenant = new Date()): Promise<EtatQuota> {
  const { prisma } = await import("@/lib/prisma");
  const debutMois = debutMoisUTC(maintenant);
  const [utilisateur, documentsAvantCeMois, documentsCeMois] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { createdAt: true, plan: true, subscriptionStatus: true },
    }),
    prisma.document.count({ where: { userId, createdAt: { lt: debutMois } } }),
    prisma.document.count({ where: { userId, createdAt: { gte: debutMois } } }),
  ]);

  return calculerEtatQuota({
    createdAtUtilisateur: utilisateur?.createdAt ?? maintenant,
    plan: utilisateur?.plan ?? null,
    subscriptionStatus: utilisateur?.subscriptionStatus ?? null,
    documentsAvantCeMois,
    documentsCeMois,
    maintenant,
  });
}

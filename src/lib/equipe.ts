import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { envoyerEmailInvitationEquipe, envoyerEmailNouveauMembreEquipe } from "@/lib/email";
import { planEffectif, abonnementActif } from "@/lib/planGating";
import { origineEmail } from "@/lib/emails/assets";

const DUREE_INVITATION_JOURS = 7;
const LIMITE_MEMBRES_EQUIPES = 5;

export function accesEquipe(plan: string | null, subscriptionStatus: string | null): boolean {
  if (!subscriptionStatus || subscriptionStatus === "trialing") return true;
  if (!abonnementActif(subscriptionStatus)) return false;
  return planEffectif(plan) === "equipe";
}

export async function obtenirOuCreerEquipe(ownerId: string, nom?: string): Promise<{ id: string }> {
  const existante = await prisma.team.findUnique({ where: { ownerId } });
  if (existante) return existante;

  const owner = await prisma.user.findUnique({
    where: { id: ownerId },
    select: { entrepriseNom: true, name: true, companyProfile: { select: { raisonSociale: true } } },
  });
  const libelle =
    nom?.trim() ||
    owner?.companyProfile?.raisonSociale ||
    owner?.entrepriseNom ||
    owner?.name ||
    "Mon équipe";

  const equipe = await prisma.team.create({
    data: { ownerId, name: libelle },
  });
  return equipe;
}

function hasherToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function inviterMembreEquipe(
  ownerId: string,
  email: string,
  options?: { nomEntreprise?: string; prenomOwner?: string },
): Promise<{ succes: true } | { succes: false; erreur: string }> {
  const emailNorm = email.trim().toLowerCase();
  if (!emailNorm.includes("@")) {
    return { succes: false, erreur: "Email invalide." };
  }

  const owner = await prisma.user.findUnique({
    where: { id: ownerId },
    select: { email: true, plan: true, subscriptionStatus: true, name: true, entrepriseNom: true },
  });
  if (!owner || !accesEquipe(owner.plan, owner.subscriptionStatus)) {
    return { succes: false, erreur: "Les invitations équipe sont réservées au plan Équipe." };
  }
  if (emailNorm === owner.email.toLowerCase()) {
    return { succes: false, erreur: "Vous ne pouvez pas vous inviter vous-même." };
  }

  const equipe = await obtenirOuCreerEquipe(ownerId, options?.nomEntreprise);
  const [membres, invitations] = await Promise.all([
    prisma.teamMember.count({ where: { teamId: equipe.id } }),
    prisma.teamInvitation.count({ where: { teamId: equipe.id, acceptedAt: null, expiresAt: { gt: new Date() } } }),
  ]);
  if (membres + invitations >= LIMITE_MEMBRES_EQUIPES) {
    return { succes: false, erreur: `Limite de ${LIMITE_MEMBRES_EQUIPES} membres atteinte.` };
  }

  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + DUREE_INVITATION_JOURS);

  await prisma.teamInvitation.upsert({
    where: { teamId_email: { teamId: equipe.id, email: emailNorm } },
    create: {
      teamId: equipe.id,
      email: emailNorm,
      tokenHash: hasherToken(token),
      expiresAt,
    },
    update: {
      tokenHash: hasherToken(token),
      expiresAt,
      acceptedAt: null,
    },
  });

  const origine = origineEmail();
  const urlInvitation = `${origine}/invitation/${token}`;
  const nomEntreprise = options?.nomEntreprise ?? owner.entrepriseNom ?? "votre entreprise";
  const prenomOwner = options?.prenomOwner ?? owner.name?.split(" ")[0] ?? "Votre patron";

  try {
    await envoyerEmailInvitationEquipe(emailNorm, {
      nomInvitant: prenomOwner,
      nomEntreprise,
      urlInvitation,
      origine,
    });
  } catch (erreur) {
    console.error("Email invitation équipe échoué :", erreur);
    return { succes: false, erreur: "Invitation créée mais l'email n'a pas pu être envoyé." };
  }

  return { succes: true };
}

export async function accepterInvitationEquipe(
  token: string,
  userId: string,
): Promise<{ succes: true } | { succes: false; erreur: string }> {
  const invitation = await prisma.teamInvitation.findFirst({
    where: {
      tokenHash: hasherToken(token),
      acceptedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: {
      team: {
        include: {
          owner: { select: { id: true, email: true, name: true, entrepriseNom: true } },
        },
      },
    },
  });

  if (!invitation) {
    return { succes: false, erreur: "Invitation invalide ou expirée." };
  }

  const utilisateur = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, workspaceOwnerId: true, ownedTeam: { select: { id: true } } },
  });
  if (!utilisateur) return { succes: false, erreur: "Compte introuvable." };
  if (utilisateur.email.toLowerCase() !== invitation.email.toLowerCase()) {
    return { succes: false, erreur: "Cette invitation est destinée à une autre adresse email." };
  }
  if (utilisateur.ownedTeam) {
    return { succes: false, erreur: "Vous avez déjà votre propre espace Tarineo." };
  }
  if (utilisateur.workspaceOwnerId) {
    return { succes: false, erreur: "Vous appartenez déjà à une équipe." };
  }

  await prisma.$transaction([
    prisma.teamMember.create({
      data: {
        teamId: invitation.teamId,
        userId,
        role: invitation.role,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { workspaceOwnerId: invitation.team.ownerId },
    }),
    prisma.teamInvitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() },
    }),
  ]);

  const origine = origineEmail();
  try {
    await envoyerEmailNouveauMembreEquipe(invitation.team.owner.email, {
      nomMembre: utilisateur.email.split("@")[0],
      nomEntreprise: invitation.team.name,
      urlEquipe: `${origine}/parametres?onglet=equipe`,
      origine,
    });
  } catch {
    // Notification best-effort
  }

  return { succes: true };
}

export async function retirerMembreEquipe(ownerId: string, memberUserId: string): Promise<void> {
  const equipe = await prisma.team.findUnique({ where: { ownerId } });
  if (!equipe) return;

  await prisma.$transaction([
    prisma.teamMember.deleteMany({ where: { teamId: equipe.id, userId: memberUserId } }),
    prisma.user.updateMany({
      where: { id: memberUserId, workspaceOwnerId: ownerId },
      data: { workspaceOwnerId: null },
    }),
  ]);
}

export async function chargerEquipe(ownerId: string) {
  const equipe = await prisma.team.findUnique({
    where: { ownerId },
    include: {
      members: {
        include: { user: { select: { id: true, email: true, name: true } } },
        orderBy: { joinedAt: "asc" },
      },
      invitations: {
        where: { acceptedAt: null, expiresAt: { gt: new Date() } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  return equipe;
}

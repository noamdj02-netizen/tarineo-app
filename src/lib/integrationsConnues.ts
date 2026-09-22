import { logoDev } from "@/lib/fournisseursConnus";

export type StatutIntegration = "actif" | "bientot";

/** URI à renseigner dans la console du fournisseur (OAuth, webhook, etc.). */
export interface RedirectionIntegration {
  label: string;
  /** Chemin absolu (ex. /api/...) ou chaîne vide pour l'origine seule (JavaScript autorisé). */
  chemin: string;
}

export interface IntegrationConnue {
  id: string;
  nom: string;
  desc: string;
  utilite: string;
  statut: StatutIntegration;
  action: string;
  /** URIs à configurer côté fournisseur — affichées dans Paramètres > Intégrations. */
  redirections?: RedirectionIntegration[];
  /** Domaine logo.dev, ou chemin local dans /public pour les intégrations Tarinéo. */
  logo: string;
  logoLocal?: boolean;
  /** Classes du conteneur 48×48 (fond de marque, sans bordure grise, etc.). */
  conteneurLogo?: string;
  /** Classes de l'image à l'intérieur du conteneur. */
  logoClassName?: string;
  /** Pastille de repli si logo.dev échoue. */
  couleur: string;
}

export const INTEGRATIONS_CONNUES: IntegrationConnue[] = [
  {
    id: "insee",
    nom: "INSEE — API Entreprise",
    logo: logoDev("insee.fr"),
    couleur: "bg-[#E8E8FF] text-[#000091]",
    desc: "Retrouvez automatiquement le SIRET, l'adresse et la raison sociale de vos clients lors de la création d'un devis.",
    utilite: "Devis clients · conformité",
    statut: "actif",
    action: "Utilisé dans vos devis",
  },
  {
    id: "gmail",
    nom: "Gmail",
    logo: logoDev("gmail.com"),
    couleur: "bg-[#FDECEC] text-[#EA4335]",
    desc: "Importez vos contacts clients Gmail pour les retrouver en un clic quand vous rédigez un devis.",
    utilite: "Devis clients · carnet contacts",
    statut: "bientot",
    action: "Connecter",
    redirections: [
      { label: "Origine JavaScript autorisée", chemin: "" },
      { label: "URI de redirection OAuth (contacts)", chemin: "/api/integrations/gmail/callback" },
    ],
  },
  {
    id: "email-fournisseur",
    nom: "E-mail fournisseur",
    logo: "/brand/tarineo-mark.svg",
    logoLocal: true,
    couleur: "bg-[#FFF0E8] text-[#EC5821]",
    desc: "Transférez les PDF reçus de Cedeo, Point P ou Rexel vers Tarinéo — l'IA les analyse sans photo.",
    utilite: "Import documents · bureau",
    statut: "actif",
    action: "Configurer dans Paramètres",
    redirections: [{ label: "Webhook Resend (réception des e-mails)", chemin: "/api/webhooks/resend/inbound" }],
  },
  {
    id: "whatsapp",
    nom: "WhatsApp Business",
    logo: "/integrations/whatsapp.svg",
    logoLocal: true,
    conteneurLogo: "border-transparent bg-transparent p-0",
    logoClassName: "size-full object-cover p-0",
    couleur: "bg-[#E8F8EE] text-[#25D366]",
    desc: "Envoyez un ticket, un bon de commande ou une alerte de hausse de prix à votre comptable depuis le chantier.",
    utilite: "Chef de chantier · partage rapide",
    statut: "bientot",
    action: "Connecter",
    redirections: [{ label: "URL de callback (webhook Meta)", chemin: "/api/integrations/whatsapp/webhook" }],
  },
  {
    id: "pennylane",
    nom: "Pennylane",
    logo: logoDev("pennylane.com"),
    couleur: "bg-[#E6FAF5] text-[#00D4AA]",
    desc: "Exportez vos achats fournisseurs vers Pennylane sans ressaisie — idéal pour la clôture mensuelle.",
    utilite: "Comptabilité · expert-comptable",
    statut: "bientot",
    action: "Connecter",
    redirections: [{ label: "URI de redirection OAuth", chemin: "/api/integrations/pennylane/callback" }],
  },
];

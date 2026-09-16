import { Badge } from "@/components/ui/badge";

const INTEGRATIONS = [
  {
    id: "whatsapp",
    nom: "WhatsApp Business",
    desc: "Envoyer un bon de commande ou une photo de ticket à votre comptable en un clic depuis Tarineo.",
    utilite: "Chef de chantier · achats urgents · preuve de dépense",
    statut: "bientot" as const,
  },
  {
    id: "google-drive",
    nom: "Google Drive",
    desc: "Sauvegarder automatiquement chaque facture et devis importé dans un dossier partagé (compta, bureau).",
    utilite: "Dirigeant · secrétaire · expert-comptable",
    statut: "bientot" as const,
  },
  {
    id: "pennylane",
    nom: "Pennylane / Sage",
    desc: "Exporter les achats fournisseurs et notes de frais vers votre logiciel comptable sans ressaisie.",
    utilite: "Comptabilité · clôture mensuelle",
    statut: "bientot" as const,
  },
  {
    id: "siret",
    nom: "API Entreprise (INSEE)",
    desc: "Auto-compléter SIRET, adresse et forme juridique du client lors de la création d'un devis.",
    utilite: "Devis clients · conformité",
    statut: "bientot" as const,
  },
  {
    id: "push",
    nom: "Notifications push",
    desc: "Alerte immédiate sur téléphone quand une hausse de prix est détectée sur un devis reçu.",
    utilite: "Artisan terrain · acheteur",
    statut: "bientot" as const,
  },
  {
    id: "email",
    nom: "E-mail fournisseur",
    desc: "Transférer un PDF reçu par mail vers Tarineo pour analyse automatique (alias dédié).",
    utilite: "Bureau · sans photo",
    statut: "bientot" as const,
  },
];

export function ParametresIntegrations() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold">Connectez les outils que vous utilisez déjà</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Chaque intégration se connecte en un clic (OAuth ou clé API) — pas de ressaisie. Priorité : WhatsApp et
          export compta pour les chefs de chantier.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {INTEGRATIONS.map((int) => (
          <div
            key={int.id}
            className="flex flex-col rounded-[20px] border border-[#E6E9EB] bg-white p-5 opacity-90"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-foreground">{int.nom}</h3>
              <Badge variant="secondary">Bientôt</Badge>
            </div>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">{int.desc}</p>
            <p className="mt-3 text-xs text-primary">{int.utilite}</p>
            <button
              type="button"
              disabled
              className="mt-4 inline-flex h-10 cursor-not-allowed items-center justify-center rounded-full border border-[#E6E9EB] px-4 text-sm text-muted-foreground"
            >
              Connecter
            </button>
          </div>
        ))}
      </div>
      <p className="rounded-xl bg-secondary px-4 py-3 text-sm text-muted-foreground">
        <strong className="font-medium text-foreground">WhatsApp en priorité :</strong> le chef de chantier photographie
        un ticket ou un bon, Tarineo l&apos;analyse, puis peut le renvoyer au dirigeant ou au comptable via WhatsApp —
        sans quitter l&apos;app.
      </p>
    </div>
  );
}

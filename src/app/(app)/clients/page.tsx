import { EmptyState } from "@/components/tarineo/EmptyState";

/**
 * Pas de CRM clients dédié pour l'instant : les noms clients vivent sur les devis.
 * On évite d'afficher une fausse liste.
 */
export default function ClientsPage() {
  return (
    <EmptyState
      title="Clients"
      subtitle="Les clients apparaîtront ici au fur et à mesure de vos devis."
      heading="Pas encore de carnet clients"
      description="Créez un devis client : le nom du client est enregistré avec le devis. Un carnet clients dédié arrivera plus tard."
      primary={{ href: "/devis-clients/nouveau", label: "+ Créer un devis client" }}
      secondary={{ href: "/devis-clients", label: "Voir mes devis" }}
      variant="user"
    />
  );
}

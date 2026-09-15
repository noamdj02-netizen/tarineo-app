import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  envoye: "bg-[#E8F1FF] text-[#3B6AE1]",
  envoyee: "bg-[#E8F1FF] text-[#3B6AE1]",
  accepte: "bg-[#E9F8EE] text-[#1F9D55]",
  payee: "bg-[#E9F8EE] text-[#1F9D55]",
  confirme: "bg-[#E9F8EE] text-[#1F9D55]",
  enleve: "bg-[#E9F8EE] text-[#1F9D55]",
  brouillon: "bg-[#FFF3E6] text-[#E67A1F]",
  expire: "bg-[#FDECEC] text-[#D64545]",
  refuse: "bg-[#FDECEC] text-[#D64545]",
  annule: "bg-[#FDECEC] text-[#D64545]",
  en_retard: "bg-[#FDECEC] text-[#D64545]",
  a_enlever: "bg-[#E8F1FF] text-[#3B6AE1]",
  actif: "bg-[#E9F8EE] text-[#1F9D55]",
  professionnel: "bg-[#F3F4F6] text-[#53616A]",
  fournisseur: "bg-[#FFF0E8] text-[#EC5821]",
  fiabilite: "bg-[#E9F8EE] text-[#1F9D55]",
  transmise: "bg-[#E9F8EE] text-[#1F9D55]",
  erreur: "bg-[#FDECEC] text-[#D64545]",
  conforme: "bg-[#E9F8EE] text-[#1F9D55]",
  hausse: "bg-[#FFF3E6] text-[#E67A1F]",
  hausse_ok: "bg-[#E9F8EE] text-[#1F9D55]",
};

const LABELS: Record<string, string> = {
  envoye: "Envoyé",
  envoyee: "Envoyée",
  accepte: "Accepté",
  payee: "Payée",
  confirme: "Confirmé",
  enleve: "Enlevé",
  brouillon: "Brouillon",
  expire: "Expiré",
  refuse: "Refusé",
  annule: "Annulé",
  en_retard: "En retard",
  a_enlever: "À enlever",
  actif: "Client actif",
  professionnel: "Professionnel",
  fournisseur: "Fournisseur",
  transmise: "Transmise",
  erreur: "Erreur",
  conforme: "Conforme",
};

export function StatusBadge({ statut, label, className }: { statut: string; label?: string; className?: string }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium", STYLES[statut] ?? "bg-secondary text-muted-foreground", className)}>
      {label ?? LABELS[statut] ?? statut}
    </span>
  );
}

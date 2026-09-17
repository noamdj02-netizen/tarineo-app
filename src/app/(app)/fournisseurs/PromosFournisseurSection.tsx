"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PromoPersonnalisee } from "@/lib/promosFournisseur";
import { rafraichirPromosAction } from "./actions";

const formaterDate = (date: Date | string | null) => {
  if (!date) return null;
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
};

export function PromosFournisseurSection({
  bibliothequeId,
  nomEnseigne,
  promosInitiales,
  derniereMiseAJour,
  fluxActif,
}: {
  bibliothequeId: string;
  nomEnseigne: string;
  promosInitiales: PromoPersonnalisee[];
  derniereMiseAJour: string | null;
  fluxActif: boolean;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [ouvert, setOuvert] = useState(false);
  const [enCours, startTransition] = useTransition();

  function rafraichir() {
    setMessage(null);
    startTransition(async () => {
      const resultat = await rafraichirPromosAction(bibliothequeId);
      setMessage(resultat.message);
      if (resultat.succes) router.refresh();
    });
  }

  if (!fluxActif) return null;

  const pertinentes = promosInitiales.filter((p) => p.pertinentePourVous);
  const autres = promosInitiales.filter((p) => !p.pertinentePourVous);

  return (
    <details
      className="rounded-[16px] border border-[#EEF0F2] bg-white"
      open={ouvert}
      onToggle={(e) => setOuvert((e.target as HTMLDetailsElement).open)}
    >
      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-foreground [&::-webkit-details-marker]:hidden">
        <span className="flex items-center justify-between gap-2">
          Mise à jour automatique depuis le site web (expérimental)
          <span className="text-xs font-normal text-muted-foreground">{ouvert ? "Masquer" : "Afficher"}</span>
        </span>
      </summary>
      <div className="space-y-4 border-t border-[#EEF0F2] px-4 py-4">
        <p className="text-sm text-muted-foreground">
          Cedeo, Point P et d&apos;autres enseignes bloquent souvent les robots (erreur 403). Les promos les plus
          fiables arrivent par <strong className="font-medium text-foreground">e-mail de votre commercial</strong> —
          transfert automatique prévu dans une prochaine version.
        </p>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            {derniereMiseAJour
              ? `Dernière tentative : ${formaterDate(derniereMiseAJour)}`
              : "Aucune mise à jour live réussie pour l'instant"}
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-full"
            disabled={enCours}
            onClick={rafraichir}
          >
            {enCours ? "Tentative…" : "Tenter une mise à jour"}
          </Button>
        </div>

        {message && <p className="text-sm text-muted-foreground">{message}</p>}

        {promosInitiales.length === 0 && !enCours && (
          <p className="rounded-[12px] bg-secondary px-3 py-3 text-sm text-muted-foreground">
            Rien à afficher depuis le site public de {nomEnseigne} pour le moment — c&apos;est normal pour la plupart
            des enseignes BTP.
          </p>
        )}

        {pertinentes.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Recoupant vos achats</h3>
            <ul className="space-y-3">
              {pertinentes.map((p) => (
                <PromoCarte key={p.id} promo={p} />
              ))}
            </ul>
          </div>
        )}

        {autres.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Autres promos détectées</h3>
            <ul className="space-y-3">
              {autres.map((p) => (
                <PromoCarte key={p.id} promo={p} />
              ))}
            </ul>
          </div>
        )}
      </div>
    </details>
  );
}

function PromoCarte({ promo }: { promo: PromoPersonnalisee }) {
  return (
    <li className="rounded-[12px] border border-[#EEF0F2] bg-[#FAFBFC] p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="font-medium text-foreground">{promo.titre}</p>
        <div className="flex flex-wrap gap-2">
          {promo.pertinentePourVous && <Badge className="bg-primary text-white">Dans vos achats</Badge>}
          {promo.remisePct != null && <Badge variant="secondary">-{promo.remisePct.toFixed(0)} %</Badge>}
        </div>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{promo.description}</p>
      {promo.valableJusquA && (
        <p className="mt-2 text-xs text-muted-foreground">Jusqu&apos;au {formaterDate(promo.valableJusquA)}</p>
      )}
    </li>
  );
}

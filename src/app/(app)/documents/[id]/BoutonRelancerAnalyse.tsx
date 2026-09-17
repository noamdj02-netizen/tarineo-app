"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { relancerAnalyseDocument } from "./actions";

const MESSAGES_ERREUR = {
  non_autorise: "Session expirée — reconnectez-vous.",
  introuvable: "Document introuvable.",
  ia_non_configuree:
    "Clé API Anthropic absente. Ajoutez ANTHROPIC_API_KEY dans votre fichier .env, redémarrez le serveur, puis réessayez.",
  erreur: "L'analyse a échoué. Réessayez dans quelques instants.",
} as const;

export function BoutonRelancerAnalyse({ documentId }: { documentId: string }) {
  const router = useRouter();
  const [enCours, startTransition] = useTransition();
  const [erreur, setErreur] = useState<string | null>(null);

  function relancer() {
    setErreur(null);
    startTransition(async () => {
      const resultat = await relancerAnalyseDocument(documentId);
      if (!resultat.succes) {
        setErreur(MESSAGES_ERREUR[resultat.erreur]);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <Button type="button" onClick={relancer} disabled={enCours} className="w-fit rounded-full">
        {enCours ? "Analyse en cours…" : "Relancer l'analyse"}
      </Button>
      {erreur && <p className="text-sm text-red-600">{erreur}</p>}
    </div>
  );
}

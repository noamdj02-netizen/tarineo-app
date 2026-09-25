"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MascotteAnalyse } from "@/components/tarineo/MascotteAnalyse";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress, ProgressLabel } from "@/components/ui/progress";
import { LABELS_STATUT } from "@/lib/documentLabels";
import { marquerOnboardingTermine } from "@/app/(app)/onboarding/actions";
import { ListeDocumentsAnalyseLot, type LigneDocumentAnalyse } from "./ListeDocumentsAnalyseLot";

const INTERVALLE_MS = 3_000;

type EtatLot = {
  documents: LigneDocumentAnalyse[];
  total: number;
  traites: number;
  termine: boolean;
};

const MESSAGES_ROTATION = [
  "Lecture des PDF et photos…",
  "Distributeur ou document client ?",
  "Type de document et enseigne…",
  "Classement dans vos sections…",
  "Comparaison à votre historique de prix…",
];

export function SuiviAnalysesLot({
  documentIds,
  redirectWhenDone = "/accueil",
  marquerOnboarding = false,
  titre = "Analyse de vos documents",
}: {
  documentIds: string[];
  redirectWhenDone?: string;
  marquerOnboarding?: boolean;
  titre?: string;
}) {
  const router = useRouter();
  const [etat, setEtat] = useState<EtatLot | null>(null);
  const [erreur, setErreur] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const enCours = useRef(false);

  const poll = useCallback(async () => {
    if (enCours.current || documentIds.length === 0) return;
    enCours.current = true;
    try {
      const params = new URLSearchParams({ ids: documentIds.join(",") });
      const res = await fetch(`/api/documents/analyses-lot?${params}`, { cache: "no-store" });
      if (!res.ok) {
        setErreur(true);
        return;
      }
      const data = (await res.json()) as EtatLot;
      setEtat(data);
      setErreur(false);
    } catch {
      setErreur(true);
    } finally {
      enCours.current = false;
    }
  }, [documentIds]);

  useEffect(() => {
    poll();
    const intervalle = setInterval(poll, INTERVALLE_MS);
    const onVisible = () => {
      if (!document.hidden) poll();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(intervalle);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [poll]);

  const total = etat?.total ?? documentIds.length;
  const traites = etat?.traites ?? 0;
  const enAnalyse = total > 0 ? total - traites : documentIds.length;
  const pct = total > 0 ? Math.round((traites / total) * 100) : 0;
  const termine = etat?.termine ?? false;

  useEffect(() => {
    if (termine) return;
    const t = setInterval(() => setMessageIndex((i) => (i + 1) % MESSAGES_ROTATION.length), 4_000);
    return () => clearInterval(t);
  }, [termine]);

  const redirectionAutoFaite = useRef(false);
  useEffect(() => {
    if (!termine || redirectionAutoFaite.current || !etat) return;
    if (documentIds.length !== 1) return;
    redirectionAutoFaite.current = true;
    const doc = etat.documents[0];
    if (doc?.domaine === "entreprise" && doc.redirectTo) {
      router.replace(doc.redirectTo);
      return;
    }
    router.replace(`/documents/${documentIds[0]}`);
  }, [termine, etat, documentIds, router]);

  async function allerVersSuite() {
    if (marquerOnboarding) {
      await marquerOnboardingTermine();
    }
    router.push(redirectWhenDone);
    router.refresh();
  }

  const erreurs = etat?.documents.filter((d) => d.status === "ERROR") ?? [];
  const aVerifier = etat?.documents.filter((d) => d.status === "NEEDS_REVIEW") ?? [];

  const lignes: LigneDocumentAnalyse[] =
    etat?.documents ??
    documentIds.map((id) => ({
      id,
      status: "PROCESSING",
      titre: "Document",
      libelleType: "",
      domaine: "distributeur",
      redirectTo: undefined,
    }));

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 py-6">
      <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left">
        <MascotteAnalyse size="lg" priority className="shrink-0 sm:mr-6" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium uppercase tracking-wider text-primary">Import terminé</p>
          <h1 className="mt-2 text-2xl font-semibold leading-tight text-foreground sm:text-3xl">{titre}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {termine
              ? "Tous vos documents ont été traités. Consultez la liste ci-dessous ou passez à vos analyses."
              : enAnalyse > 0
                ? `${enAnalyse} analyse${enAnalyse > 1 ? "s" : ""} encore en cours sur ${total}. Vous pouvez quitter cette page : le classement continue en arrière-plan.`
                : "Connexion au suivi…"}
          </p>
        </div>
      </div>

      <Card className="border-primary/15 bg-primary/5 ring-foreground/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Progression</CardTitle>
          {!termine && (
            <CardDescription className="animate-pulse">{MESSAGES_ROTATION[messageIndex]}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <Progress value={pct} className="flex-col items-stretch gap-2">
            <ProgressLabel className="flex w-full items-baseline justify-between gap-2">
              <span className="text-2xl font-semibold tabular-nums text-foreground">
                {traites}
                <span className="text-base font-normal text-muted-foreground"> / {total}</span>
              </span>
              <span className="text-sm tabular-nums text-muted-foreground">{pct} %</span>
            </ProgressLabel>
          </Progress>
          <p className="mt-2 text-sm text-muted-foreground">analyses terminées</p>
        </CardContent>
      </Card>

      {erreur && (
        <Alert>
          <AlertDescription>
            Impossible de joindre le serveur. Nouvelle tentative automatique…
          </AlertDescription>
        </Alert>
      )}

      <ListeDocumentsAnalyseLot documents={lignes} total={total} traites={traites} />

      {termine && (
        <div className="flex flex-col gap-3">
          {(erreurs.length > 0 || aVerifier.length > 0) && (
            <Alert>
              <AlertDescription>
                {erreurs.length > 0 && `${erreurs.length} en erreur (clé IA ou fichier illisible). `}
                {aVerifier.length > 0 && `${aVerifier.length} à vérifier manuellement.`}
              </AlertDescription>
            </Alert>
          )}
          <Button type="button" className="h-12 w-full rounded-full" onClick={() => void allerVersSuite()}>
            {marquerOnboarding ? "Voir mon résumé" : "Voir mes analyses"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full rounded-full"
            render={<Link href="/documents" />}
          >
            Tous les documents distributeur
          </Button>
        </div>
      )}

      {!termine && (
        <p className="text-center text-xs text-muted-foreground">
          Statuts : {LABELS_STATUT.PROCESSING} → classement automatique par l&apos;IA
        </p>
      )}
    </div>
  );
}

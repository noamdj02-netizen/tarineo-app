"use client";

import Link from "next/link";
import { FileTextIcon, ImageIcon, Loader2Icon, XIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress, ProgressLabel } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { DoublonPotentiel } from "@/lib/documents";

export type StatutFichierImport = "en_attente" | "envoi" | "succes" | "erreur" | "doublon";

export type LigneFileImport = {
  id: string;
  file: File;
  statut: StatutFichierImport;
  message?: string;
  doublon?: DoublonPotentiel;
};

function formaterTaille(octets: number): string {
  if (octets < 1024) return `${octets} o`;
  if (octets < 1024 * 1024) return `${(octets / 1024).toFixed(0)} Ko`;
  return `${(octets / (1024 * 1024)).toFixed(1)} Mo`;
}

function libelleStatut(ligne: LigneFileImport): string {
  switch (ligne.statut) {
    case "en_attente":
      return "En attente";
    case "envoi":
      return "Envoi…";
    case "succes":
      return "Envoyé";
    case "erreur":
      return ligne.message ?? "Erreur";
    case "doublon":
      return "Doublon ?";
  }
}

function badgeVariant(statut: StatutFichierImport): "secondary" | "default" | "outline" | "destructive" {
  if (statut === "erreur") return "destructive";
  if (statut === "doublon") return "outline";
  if (statut === "succes") return "default";
  if (statut === "envoi") return "default";
  return "secondary";
}

function iconeFichier(file: File) {
  const estImage = file.type.startsWith("image/");
  const Icone = estImage ? ImageIcon : FileTextIcon;
  return <Icone className="size-4 shrink-0 text-muted-foreground" aria-hidden />;
}

export function FileImportQueue({
  fichiers,
  plafondFichiers,
  enCours,
  progression,
  onRetirer,
  onEnvoyerQuandMeme,
  onVoirDocumentExistant,
}: {
  fichiers: LigneFileImport[];
  plafondFichiers: number;
  enCours: boolean;
  progression: { traites: number; total: number } | null;
  onRetirer: (id: string) => void;
  onEnvoyerQuandMeme: (id: string) => void;
  onVoirDocumentExistant?: (documentId: string) => void;
}) {
  if (fichiers.length === 0) return null;

  const pct =
    progression && progression.total > 0
      ? Math.round((progression.traites / progression.total) * 100)
      : 0;

  return (
    <Card size="sm" className="ring-foreground/5">
      <CardHeader className="pb-0">
        <CardTitle className="text-base font-semibold">Documents à envoyer</CardTitle>
        <CardDescription>
          {fichiers.length} / {plafondFichiers} fichier{fichiers.length > 1 ? "s" : ""} dans la file
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <ScrollArea className="max-h-[min(40vh,280px)] pr-3">
          <ul className="flex flex-col gap-2">
            {fichiers.map((f) => (
              <li
                key={f.id}
                className={cn(
                  "rounded-lg border bg-background p-3",
                  f.statut === "doublon" && "border-amber-200 bg-amber-50/50",
                  f.statut === "erreur" && "border-destructive/30",
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{iconeFichier(f.file)}</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground" title={f.file.name}>
                      {f.file.name}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{formaterTaille(f.file.size)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {f.statut === "envoi" ? (
                      <Badge variant="secondary" className="gap-1">
                        <Loader2Icon className="animate-spin" data-icon="inline-start" />
                        Envoi
                      </Badge>
                    ) : (
                      <Badge variant={badgeVariant(f.statut)}>{libelleStatut(f)}</Badge>
                    )}
                    {!enCours && f.statut !== "envoi" && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground"
                        onClick={() => onRetirer(f.id)}
                        aria-label={`Retirer ${f.file.name}`}
                      >
                        <XIcon />
                      </Button>
                    )}
                  </div>
                </div>
                {f.statut === "doublon" && (
                  <>
                    <Separator className="my-2 bg-amber-200/60" />
                    <p className="text-xs text-muted-foreground">
                      {f.message} Ce fichier est déjà dans Tarinéo. « Envoyer quand même » crée un{" "}
                      <strong className="font-medium text-foreground">brouillon temporaire (4 jours)</strong> puis
                      lance l&apos;analyse.
                    </p>
                    <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                      {f.doublon?.documentId && (
                        <Button
                          type="button"
                          size="sm"
                          className="shrink-0 rounded-full"
                          onClick={() => onVoirDocumentExistant?.(f.doublon!.documentId)}
                        >
                          Voir le document existant
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shrink-0 rounded-full"
                        onClick={() => onEnvoyerQuandMeme(f.id)}
                        disabled={enCours}
                      >
                        Envoyer quand même
                      </Button>
                    </div>
                  </>
                )}
                {f.statut === "erreur" && f.message && (
                  <p className="mt-2 text-xs text-destructive">{f.message}</p>
                )}
              </li>
            ))}
          </ul>
        </ScrollArea>

        {progression && (
          <Progress value={pct} className="flex-col items-stretch gap-1">
            <ProgressLabel className="flex w-full justify-between text-xs text-muted-foreground">
              <span>Envoi en cours</span>
              <span className="tabular-nums">
                {progression.traites}/{progression.total}
              </span>
            </ProgressLabel>
          </Progress>
        )}
      </CardContent>
    </Card>
  );
}

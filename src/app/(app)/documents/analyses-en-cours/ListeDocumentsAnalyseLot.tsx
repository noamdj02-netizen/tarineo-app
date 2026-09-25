"use client";

import Link from "next/link";
import { BadgeStatutDocument } from "@/components/tarineo/BadgeStatutDocument";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export type LigneDocumentAnalyse = {
  id: string;
  status: string;
  domaine: string;
  titre: string;
  libelleType: string;
  redirectTo?: string;
};

export function ListeDocumentsAnalyseLot({
  documents,
  total,
  traites,
}: {
  documents: LigneDocumentAnalyse[];
  total: number;
  traites: number;
}) {
  return (
    <Card className="ring-foreground/5">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Documents importés</CardTitle>
        <CardDescription>
          {traites} sur {total} analyse{total > 1 ? "s" : ""} terminée{traites > 1 ? "s" : ""} — classement automatique
          par l&apos;IA
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[min(50vh,360px)] pr-3">
          <ul className="flex flex-col gap-2">
            {documents.map((doc, index) => (
              <li key={doc.id}>
                {index > 0 && <Separator className="mb-2" />}
                <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 px-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{doc.titre}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {doc.libelleType || "Document"}
                      {doc.domaine === "entreprise" ? " · Ventes clients" : " · Distributeur"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <BadgeStatutDocument statut={doc.status} />
                    {doc.status !== "PROCESSING" && (
                      <Link
                        href={doc.redirectTo ?? `/documents/${doc.id}`}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Ouvrir
                      </Link>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

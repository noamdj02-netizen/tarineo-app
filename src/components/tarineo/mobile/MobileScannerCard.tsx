"use client";

import Link from "next/link";
import { CameraIcon, ChevronRightIcon, ClockIcon, FileTextIcon } from "lucide-react";
import { ImportDocument } from "@/app/(app)/documents/ImportDocument";
import { MascotteDashboard } from "@/components/tarineo/MascotteDashboard";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

/** Carte hero mobile — ouvre le choix Photo / Photothèque / Fichier. */
export function MobileScannerCard() {
  return (
    <Card className="relative gap-0 overflow-hidden rounded-[28px] border-0 bg-card py-0 shadow-[0_8px_28px_rgba(15,28,40,0.07)] ring-1 ring-foreground/8">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-4 top-2 size-36 rounded-full bg-[radial-gradient(circle,rgba(236,88,33,0.16)_0%,rgba(236,88,33,0)_70%)]"
      />

      <CardHeader className="relative grid-cols-[1fr_auto] items-start gap-2 px-5 pt-5 pb-0">
        <div className="min-w-0">
          <CardTitle className="font-sans text-[22px] font-bold leading-[1.15] tracking-[-0.45px] text-foreground">
            Scanner un document
          </CardTitle>
          <CardDescription className="mt-2 max-w-[200px] text-[13px] leading-[1.45]">
            Photo, photothèque ou PDF — détectez automatiquement les hausses de prix.
          </CardDescription>
        </div>
        <CardAction className="self-end justify-self-end">
          <MascotteDashboard variant="loupe" width={108} height={114} priority className="-mb-1 -mr-1" />
        </CardAction>
      </CardHeader>

      <CardFooter className="relative mt-4 flex flex-col gap-2.5 border-0 bg-transparent px-5 pb-5">
        <ImportDocument
          preferCamera
          trigger={
            <Button className="h-12 w-full justify-between rounded-full px-5 text-[15px] font-semibold shadow-[0_8px_20px_rgba(236,88,33,0.32)]">
              <span className="inline-flex items-center gap-2">
                <CameraIcon data-icon="inline-start" aria-hidden />
                Importer maintenant
              </span>
              <ChevronRightIcon data-icon="inline-end" aria-hidden />
            </Button>
          }
        />

        <div className="grid w-full grid-cols-2 gap-2">
          <ImportDocument
            trigger={
              <Button
                variant="outline"
                className="h-11 w-full rounded-full border-border bg-muted/40 px-3 text-[12px] font-semibold"
              >
                <FileTextIcon data-icon="inline-start" aria-hidden />
                <span className="truncate">Fichier / photo</span>
              </Button>
            }
          />
          <Button
            variant="outline"
            className="h-11 rounded-full border-border bg-muted/40 px-3 text-[12px] font-semibold"
            render={<Link href="/documents" />}
            nativeButton={false}
          >
            <ClockIcon data-icon="inline-start" aria-hidden />
            Historique
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

"use client";

import { CameraIcon, ChevronRightIcon } from "lucide-react";
import { ImportDocument } from "@/app/(app)/documents/ImportDocument";
import { MascotteDashboard } from "@/components/tarineo/MascotteDashboard";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

/** Carte hero mobile — mascotte centrée + un seul CTA principal (Apple-like). */
export function MobileScannerCard() {
  return (
    <Card className="relative gap-0 overflow-visible rounded-[28px] border-0 bg-card py-0 shadow-[0_8px_28px_rgba(15,28,40,0.07)] ring-1 ring-foreground/8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-28 rounded-t-[28px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(236,88,33,0.14)_0%,rgba(236,88,33,0)_70%)]"
      />

      <CardHeader className="relative flex flex-col items-center gap-3 px-5 pt-6 pb-0 text-center">
        <MascotteDashboard variant="loupe" width={96} height={102} priority className="mx-auto" />
        <div className="min-w-0 max-w-[280px]">
          <CardTitle className="font-sans text-[22px] font-bold leading-[1.15] tracking-[-0.45px] text-[#0f1c28]">
            Scanner un document
          </CardTitle>
          <CardDescription className="mt-2 text-[13px] leading-[1.45] text-[#8a96a3]">
            Photo, photothèque ou PDF — détectez les hausses de prix.
          </CardDescription>
        </div>
      </CardHeader>

      <CardFooter className="relative mt-5 flex flex-col gap-2 border-0 bg-transparent px-5 pb-5">
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
      </CardFooter>
    </Card>
  );
}

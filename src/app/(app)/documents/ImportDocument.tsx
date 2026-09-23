"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadIcon } from "lucide-react";
import { estViewportMobile } from "@/lib/mobile";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FormulaireUpload } from "./FormulaireUpload";

type Props = {
  quotaAtteint?: boolean;
  maxFichiers?: number;
  autoOpen?: boolean;
  /** Met en avant la caméra dans le choix (n’ouvre plus la caméra automatiquement). */
  preferCamera?: boolean;
  label?: string;
  size?: "default" | "sm";
  variant?: "default" | "outline";
  className?: string;
  onSucces?: () => void;
  trigger?: React.ReactElement;
};

/**
 * Import unifié — sur mobile : choix Photo / Photothèque / Fichier
 * (plus de forçage caméra qui bloquait les anciens devis).
 */
export function ImportDocument({
  quotaAtteint = false,
  maxFichiers,
  autoOpen = false,
  preferCamera = false,
  label = "Importer",
  size = "default",
  variant = "default",
  className,
  onSucces,
  trigger,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mobileUi, setMobileUi] = useState(false);
  const urlNettoyee = useRef(false);

  useEffect(() => {
    function maj() {
      setMobileUi(estViewportMobile());
    }
    maj();
    const mq = window.matchMedia("(max-width: 1023px)");
    mq.addEventListener("change", maj);
    return () => mq.removeEventListener("change", maj);
  }, []);

  useEffect(() => {
    if (!autoOpen) return;
    const delai = mobileUi ? 200 : 320;
    const timer = window.setTimeout(() => setOpen(true), delai);
    return () => window.clearTimeout(timer);
  }, [autoOpen, mobileUi]);

  useEffect(() => {
    if (!autoOpen || urlNettoyee.current || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (!params.has("scanner") && !params.has("onboarding")) return;
    params.delete("scanner");
    params.delete("onboarding");
    urlNettoyee.current = true;
    const suffixe = params.toString();
    router.replace(suffixe ? `/documents?${suffixe}` : "/documents", { scroll: false });
  }, [autoOpen, router]);

  function apresImport() {
    onSucces?.();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        nativeButton={true}
        render={
          trigger ?? (
            <Button size={size} variant={variant} className={className ?? "rounded-full"}>
              <UploadIcon data-icon="inline-start" />
              {label}
            </Button>
          )
        }
      />
      <DialogContent className="import-modal-figma gap-6 border-0 bg-[#f3f4f6] p-6 font-sans shadow-[0_8px_12px_rgba(0,0,0,0.12)] sm:max-w-[528px] sm:p-8">
        <DialogHeader className="gap-2">
          <DialogTitle className="text-[20px] font-bold leading-normal tracking-normal text-[#111827]">
            Importer un document
          </DialogTitle>
          <DialogDescription className="text-[14px] font-normal leading-[1.45] tracking-normal text-[#6b7280]">
            {mobileUi
              ? "Photo, photothèque ou fichier PDF — Tarineo détecte le type automatiquement."
              : "PDF ou photo — Tarineo détecte le type et classe le document pour vous."}
          </DialogDescription>
        </DialogHeader>
        <FormulaireUpload
          quotaAtteint={quotaAtteint}
          maxFichiers={maxFichiers}
          variantCompact
          variantPc={!mobileUi}
          choixSourcesMobile={mobileUi}
          preferCameraHint={preferCamera}
          autoOuvrirCamera={false}
          autoEnvoiApresCapture={false}
          onImportReussi={() => apresImport()}
        />
      </DialogContent>
    </Dialog>
  );
}

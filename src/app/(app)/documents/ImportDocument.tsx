"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadIcon } from "lucide-react";
import { estAppareilMobile } from "@/lib/mobile";
import { hrefApresImportDocuments } from "@/lib/importNavigation";
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
  preferCamera?: boolean;
  label?: string;
  size?: "default" | "sm";
  variant?: "default" | "outline";
  className?: string;
  onSucces?: () => void;
  trigger?: React.ReactElement;
};

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
  const [importSession, setImportSession] = useState(0);
  const urlNettoyee = useRef(false);

  // Laisse la transition de page « import » se terminer avant d'ouvrir la modale.
  useEffect(() => {
    if (!autoOpen) return;
    const delai = estAppareilMobile() ? 200 : 320;
    const timer = window.setTimeout(() => setOpen(true), delai);
    return () => window.clearTimeout(timer);
  }, [autoOpen]);

  const cameraActive = preferCamera || estAppareilMobile();

  // Évite que ?scanner=1 ou ?onboarding=1 rouvre la modale à chaque navigation.
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

  function naviguerApresImport(destination: string) {
    const depart = window.location.pathname + window.location.search;
    router.push(destination);
    router.refresh();
    window.setTimeout(() => {
      const actuel = window.location.pathname + window.location.search;
      if (actuel === depart) {
        window.location.assign(destination);
      }
    }, 350);
  }

  function apresImport(nbSucces: number, documentIds: string[]) {
    if (nbSucces === 0 || documentIds.length === 0) return;
    setOpen(false);
    onSucces?.();
    naviguerApresImport(hrefApresImportDocuments(documentIds));
  }

  function ouvrirDocumentExistant(documentId: string) {
    setOpen(false);
    naviguerApresImport(`/documents/${documentId}`);
  }

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setImportSession((s) => s + 1);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
      <DialogContent
        className="import-modal-figma gap-6 border-0 bg-[#f3f4f6] p-8 font-sans shadow-[0_8px_12px_rgba(0,0,0,0.12)] sm:max-w-[528px]"
      >
        <DialogHeader className="gap-2">
          <DialogTitle className="text-[20px] font-bold leading-normal tracking-normal text-[#111827]">
            Importer un document
          </DialogTitle>
          <DialogDescription className="text-[14px] font-normal leading-[1.45] tracking-normal text-[#6b7280]">
            PDF ou photo — Tarinéo détecte le type et classe le document pour vous.
          </DialogDescription>
        </DialogHeader>
        <FormulaireUpload
          key={importSession}
          quotaAtteint={quotaAtteint}
          maxFichiers={maxFichiers}
          variantCompact
          variantPc={!cameraActive}
          autoOuvrirCamera={cameraActive && open}
          autoEnvoiApresCapture={cameraActive}
          onImportReussi={apresImport}
          onVoirDocumentExistant={ouvrirDocumentExistant}
        />
      </DialogContent>
    </Dialog>
  );
}

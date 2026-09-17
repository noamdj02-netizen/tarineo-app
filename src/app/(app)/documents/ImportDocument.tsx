"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadIcon } from "lucide-react";
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
  const [open, setOpen] = useState(autoOpen);
  const urlNettoyee = useRef(false);

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
          quotaAtteint={quotaAtteint}
          variantCompact
          variantPc={!preferCamera}
          autoOuvrirCamera={preferCamera && open}
          onImportReussi={() => apresImport()}
        />
      </DialogContent>
    </Dialog>
  );
}

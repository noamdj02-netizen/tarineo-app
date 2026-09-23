"use client";

import { UploadIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { ImportDocument } from "@/app/(app)/documents/ImportDocument";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  style?: React.CSSProperties;
  /** Texte visible desktop — masqué si compact */
  label?: string;
  compact?: boolean;
  size?: "default" | "icon" | "icon-lg";
  icone?: React.ReactNode;
  "aria-label"?: string;
};

export function BoutonImporterNav({
  className,
  style,
  label = "Importer",
  compact = false,
  size = "default",
  icone,
  "aria-label": ariaLabel,
}: Props) {
  const reduce = useReducedMotion();
  const iconeAffiche = icone ?? <UploadIcon className={size === "icon-lg" ? "size-[26px]" : undefined} />;

  const trigger =
    size === "icon-lg" ? (
      <Button
        variant="default"
        size="icon-lg"
        style={style}
        className={cn(
          "size-14 rounded-full shadow-lg shadow-primary/30 transition-shadow duration-200",
          className,
        )}
        aria-label={ariaLabel ?? label}
      >
        {iconeAffiche}
      </Button>
    ) : compact || size === "icon" ? (
      <Button
        size="icon"
        className={cn("size-10 rounded-full transition-shadow duration-200", className)}
        aria-label={ariaLabel ?? "Importer un document"}
      >
        <UploadIcon />
      </Button>
    ) : (
      <Button className={cn("h-10 rounded-full px-4 transition-shadow duration-200", className)}>
        <UploadIcon data-icon="inline-start" />
        <span className="hidden lg:inline">{label}</span>
      </Button>
    );

  const contenu = <ImportDocument trigger={trigger} />;

  if (reduce) {
    return contenu;
  }

  return (
    <motion.div
      className="inline-flex"
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 500, damping: 28 }}
    >
      {contenu}
    </motion.div>
  );
}

import {
  Check,
  FileText,
  FolderKanban,
  ScanLine,
  Send,
  TrendingUp,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const STROKE = 1.75;

type IconProps = LucideProps;

/** Pastille icône Tarineo — bordure + fond soft. */
export function IconWell({
  children,
  className,
  tone = "accent",
}: {
  children: ReactNode;
  className?: string;
  tone?: "accent" | "ink" | "plain" | "solid";
}) {
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full shadow-sm transition-colors",
        tone === "accent" && "border border-accent/20 bg-accent-soft text-accent-700",
        tone === "ink" && "border border-ink-900/10 bg-ink-900 text-paper-0",
        tone === "plain" && "border border-line bg-paper-0 text-accent",
        tone === "solid" && "border-0 bg-gradient-to-br from-accent to-accent-active text-white shadow-sm",
        className,
      )}
    >
      {children}
    </span>
  );
}

function lucide(Icon: LucideIcon) {
  return function LucideWrap({ className, ...props }: IconProps) {
    return <Icon className={cn("size-4", className)} strokeWidth={STROKE} aria-hidden {...props} />;
  };
}

/** Nouveau devis / message. */
export const AiSendMessageIcon = lucide(Send);

/** Analyse OCR / lecture. */
export const ScanDevisIcon = lucide(ScanLine);

/** Chantier. */
export const UserSquareIcon = lucide(FolderKanban);

/** Alerte hausse. */
export const MessageQuestionIcon = lucide(TrendingUp);

/** Devis / reçu. */
export const ReceiptItemIcon = lucide(FileText);

/** Validation. */
export function TickCircleIcon({ className, ...props }: IconProps) {
  return <Check className={cn("size-3.5", className)} strokeWidth={2.5} aria-hidden {...props} />;
}

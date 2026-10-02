import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Logo TARINEO : trois barres montantes, orange → noir (fichier officiel).
 * Source : public/brand/tarineo-logo-source.png — icônes PWA générées depuis ce fichier.
 * Un léger liseré clair garde la barre noire lisible sur fond sombre.
 */
export function TarineoMark({ className, priority = true }: { className?: string; priority?: boolean }) {
  return (
    <Image
      src="/brand/tarineo-mark.png"
      alt=""
      width={64}
      height={64}
      priority={priority}
      unoptimized
      className={cn(
        "size-9 shrink-0 object-contain [filter:drop-shadow(0_0_0.6px_rgba(255,255,255,0.55))]",
        className,
      )}
    />
  );
}

import Image from "next/image";
import { couleurFournisseur } from "@/lib/couleurFournisseur";
import { cn } from "@/lib/utils";

export function MobileAvatarFournisseur({
  nom,
  norm,
  logoUrl,
  size = "md",
  variant = "circle",
  className,
}: {
  nom: string;
  norm?: string | null;
  logoUrl?: string | null;
  size?: "sm" | "md";
  variant?: "circle" | "square";
  className?: string;
}) {
  const px = size === "sm" ? 46 : 58;
  const radius = variant === "square" ? "rounded-[14px]" : "rounded-full";
  const lettre = nom.charAt(0).toUpperCase();
  const couleur = couleurFournisseur(nom, norm);

  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt=""
        width={px}
        height={px}
        className={cn("shrink-0 border-[3px] border-white object-cover shadow-[0_4px_10px_rgba(0,0,0,0.1)]", radius, className)}
        style={{ width: px, height: px }}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center border-[3px] border-white font-bold text-white shadow-[0_4px_10px_rgba(0,0,0,0.1)]",
        radius,
        size === "sm" ? "size-[46px] text-base" : "size-[58px] text-lg",
        className,
      )}
      style={{ backgroundColor: couleur }}
      aria-hidden
    >
      {lettre}
    </div>
  );
}

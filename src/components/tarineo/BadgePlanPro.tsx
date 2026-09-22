import Link from "next/link";

export function BadgePlanPro({ className }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-[#FFF0E8] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary ${className ?? ""}`}
    >
      Pro
    </span>
  );
}

export function LienPasserPro({ className }: { className?: string }) {
  return (
    <Link
      href="/parametres?onglet=abonnement"
      className={`text-sm font-medium text-primary hover:underline ${className ?? ""}`}
    >
      Passer à Pro
    </Link>
  );
}

import Link from "next/link";
import { Illustration } from "@/components/illustration";
import { Button } from "@/components/ui/button";

export function PaywallScreen({
  pending,
  onEnter,
}: {
  pending: boolean;
  onEnter: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <Illustration name="landing-victoire" className="mb-3 size-28 sm:mb-4 sm:size-40" />
      <h2 className="font-serif text-[1.45rem] leading-[1.1] tracking-[-0.02em] sm:text-[1.7rem]">
        Ton essai Pro 14 jours est lancé.
      </h2>
      <p className="mt-3 max-w-sm text-[14.5px] leading-relaxed text-muted-foreground">
        Pas un mur. Tu entres dans le cockpit. L’abonnement, si tu veux, est à côté.
      </p>
      <Button
        type="button"
        size="lg"
        className="mt-6 min-h-12 w-full max-w-sm sm:mt-8"
        disabled={pending}
        onClick={onEnter}
      >
        Entrer dans mon cockpit
      </Button>
      <Link href="/abonnement" className="mt-3 text-[14px] underline-offset-4 hover:underline">
        Voir l’abonnement
      </Link>
    </div>
  );
}

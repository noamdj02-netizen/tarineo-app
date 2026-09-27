import { TarineoHdMascot } from "@/components/tarineo-hd-mascot";
import { Button } from "@/components/ui/button";

export function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <TarineoHdMascot name="03-salut" className="mb-2 h-40 w-44" label="Tarinéo" priority />
      <h1 className="max-w-[18ch] font-display text-[clamp(1.7rem,6vw,2.4rem)] leading-[1.05] font-semibold tracking-tight">
        Déposez un devis. Envoyez la facture.
      </h1>
      <p className="mt-3 max-w-[28rem] text-[15px] leading-relaxed text-muted-foreground">
        Tarinéo lit vos pièces distributeur, les transforme pour le client, avec votre SIRET. Même tableau : orange, jaune, noir.
      </p>
      <Button type="button" size="lg" className="mt-6 min-h-12 w-full max-w-sm rounded-full" onClick={onStart}>
        Commencer
      </Button>
    </div>
  );
}

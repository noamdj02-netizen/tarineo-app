import { Choice } from "@/components/onboarding/screens/choice";
import { ONBOARD_PAINS, type OnboardPainId } from "@/lib/onboarding/catalog";

export function PainScreen({
  value,
  onToggle,
}: {
  value: OnboardPainId[];
  onToggle: (id: OnboardPainId) => void;
}) {
  return (
    <>
      <h2 className="font-serif text-[1.7rem] leading-[1.1] tracking-[-0.02em]">
        Qu’est-ce qui bloque aujourd’hui ?
      </h2>
      <p className="mt-2 text-[14.5px] leading-relaxed text-muted-foreground">
        Plusieurs choix. On s’en sert pour le pont.
      </p>
      <div className="mt-5 flex flex-col gap-2">
        {ONBOARD_PAINS.map((p) => (
          <Choice
            key={p.id}
            active={value.includes(p.id)}
            title={p.n}
            onClick={() => onToggle(p.id)}
          />
        ))}
      </div>
    </>
  );
}

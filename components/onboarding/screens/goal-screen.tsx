import { Choice } from "@/components/onboarding/screens/choice";
import { ONBOARD_GOALS, type OnboardGoalId } from "@/lib/onboarding/catalog";

export function GoalScreen({
  value,
  onChange,
}: {
  value?: OnboardGoalId;
  onChange: (id: OnboardGoalId) => void;
}) {
  return (
    <>
      <h2 className="font-serif text-[1.7rem] leading-[1.1] tracking-[-0.02em]">
        Qu’est-ce qu’on vise d’abord ?
      </h2>
      <p className="mt-2 text-[14.5px] leading-relaxed text-muted-foreground">
        Un seul but. Le reste attend.
      </p>
      <div className="mt-5 flex flex-col gap-2">
        {ONBOARD_GOALS.map((g) => (
          <Choice
            key={g.id}
            active={value === g.id}
            title={g.n}
            hint={g.hint}
            onClick={() => onChange(g.id)}
          />
        ))}
      </div>
    </>
  );
}

import { goalLabel, type OnboardGoalId, type OnboardPainId } from "@/lib/onboarding/catalog";

const BRIDGES = [
  {
    n: "Un Focus",
    text: "Un projet au centre. Les autres en pause. Une prochaine action.",
  },
  {
    n: "Landing en 5 minutes",
    text: "Hero de la bibliothèque, projet, envoi à Cursor ou au copilote.",
  },
  {
    n: "Copilote",
    text: "Il propose, il écrit, il relie schéma et post. Pas un autre outil.",
  },
] as const;

export function SolutionScreen({
  goal,
  pains,
}: {
  goal?: OnboardGoalId;
  pains: OnboardPainId[];
}) {
  return (
    <>
      <h2 className="font-serif text-[1.7rem] leading-[1.1] tracking-[-0.02em]">
        Ton but : {goalLabel(goal).toLowerCase()}.
      </h2>
      <p className="mt-2 text-[14.5px] leading-relaxed text-muted-foreground">
        {pains.length
          ? `${pains.length} frein${pains.length > 1 ? "s" : ""} noté${pains.length > 1 ? "s" : ""}. Navpit répond en trois ponts.`
          : "Navpit répond en trois ponts, même sans frein coché."}
      </p>
      <ul className="mt-5 flex flex-col gap-3">
        {BRIDGES.map((b) => (
          <li key={b.n} className="rounded-2xl border border-line bg-surface-2/70 px-4 py-3.5">
            <p className="text-[15px] font-medium">{b.n}</p>
            <p className="mt-1 text-[14px] leading-snug text-muted-foreground">{b.text}</p>
          </li>
        ))}
      </ul>
    </>
  );
}

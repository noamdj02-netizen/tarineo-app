import { Choice } from "@/components/onboarding/screens/choice";
import { Field as AuthField } from "@/components/auth/auth-ui";
import type { OnboardProject } from "@/app/(onboard)/onboarding/actions";
import { TREND_APPS, type TrendAppId } from "@/lib/onboarding/trend-apps";

export function ProjetScreen({
  existing,
  chosenId,
  ideaId,
  customName,
  onChooseExisting,
  onIdea,
  onCustom,
}: {
  existing: OnboardProject[];
  chosenId: string | null;
  ideaId: TrendAppId | null;
  customName: string;
  onChooseExisting: (id: string) => void;
  onIdea: (id: TrendAppId) => void;
  onCustom: (v: string) => void;
}) {
  return (
    <>
      <h2 className="font-serif text-[1.7rem] leading-[1.1] tracking-[-0.02em]">
        Un seul Focus.
      </h2>
      <p className="mt-2 text-[14.5px] leading-relaxed text-muted-foreground">
        Un projet déjà là, une idée tendance, ou un nom libre.
      </p>

      {existing.length ? (
        <div className="mt-5">
          <p className="mb-2 text-[13px] font-medium">Tes projets</p>
          <div className="flex flex-col gap-2">
            {existing.map((p) => (
              <Choice
                key={p.id}
                active={chosenId === p.id && !ideaId && !customName.trim()}
                title={p.name}
                hint={p.status === "focus" ? "Déjà en Focus" : p.slug}
                onClick={() => onChooseExisting(p.id)}
              />
            ))}
          </div>
        </div>
      ) : null}

      <div className={existing.length ? "mt-6" : "mt-5"}>
        <p className="mb-2 text-[13px] font-medium">Idées qui bougent maintenant</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {TREND_APPS.map((a) => (
            <Choice
              key={a.id}
              active={ideaId === a.id && !chosenId}
              title={a.n}
              hint={`${a.tag} · ${a.pitch}`}
              onClick={() => onIdea(a.id)}
            />
          ))}
        </div>
      </div>

      <div className="mt-6">
        <AuthField
          label="Ou un nom à toi"
          value={customName}
          onChange={(e) => onCustom(e.target.value)}
          placeholder="Ex. Devis Atelier Nord"
        />
      </div>
    </>
  );
}

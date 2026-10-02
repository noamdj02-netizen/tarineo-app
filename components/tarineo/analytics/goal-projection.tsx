import type { TarineoDistributor } from "@/components/tarineo/types";
import { euroInt } from "@/lib/site/tarineo";

export function GoalProjection({ distributor }: { distributor: TarineoDistributor | null }) {
  if (!distributor?.goalHt) {
    return <p className="p-4 text-[13px] text-muted-foreground">Sélectionnez un distributeur avec objectif.</p>;
  }
  const current = distributor.amountHt ?? 0;
  const goal = distributor.goalHt ?? 0;
  const remaining = Math.max(0, goal - current);
  const month = new Date().getMonth() + 1;
  const monthsLeft = Math.max(1, 12 - month);
  const pace = current / month;
  const projected = current + pace * monthsLeft;
  return (
    <div className="space-y-2 p-4 text-[14px]">
      <p className="font-medium text-ink">{distributor.name}</p>
      <p className="text-muted-foreground">
        Encours : <span className="font-medium text-ink">{euroInt(current)}</span>
      </p>
      <p className="text-muted-foreground">
        Reste à atteindre : <span className="font-medium text-ink">{euroInt(remaining)}</span>
      </p>
      <p className="text-muted-foreground">
        Projection fin d’année (rythme actuel) :{" "}
        <span className="font-medium text-ink">{euroInt(Math.round(projected))}</span>
      </p>
    </div>
  );
}

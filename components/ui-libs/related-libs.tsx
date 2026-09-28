import type { UiLib } from "@/lib/ui-libs/types";
import { UiLibCard } from "./lib-card";

export function HeroRelatedLibs({ libs }: { libs: UiLib[] }) {
  if (libs.length === 0) return null;

  return (
    <aside className="mt-10" aria-labelledby="hero-related-libs">
      <p className="mono-label" id="hero-related-libs">
        {"/ Libs utiles pour ce style ///"}
      </p>
      <p className="mb-4 mt-2 max-w-[62ch] text-[14px] text-muted-foreground">
        Liens et prompts TARINEO uniquement. On n’embarque pas le code de ces libs.
      </p>
      <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {libs.map((lib) => (
          <li key={lib.id}>
            <UiLibCard lib={lib} />
          </li>
        ))}
      </ul>
    </aside>
  );
}

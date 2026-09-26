"use client";

import { defaultValues } from "@/lib/heroes/apply";
import { isLightHex, parseHex } from "@/lib/heroes/color";
import type { HeroCard } from "@/lib/heroes/types";
import { ShineBorder } from "@/components/ui/shine-border";
import { HeroPreview } from "./previews";

export function HeroFrame({
  values,
  shine = false,
  children,
}: {
  values: Record<string, string>;
  shine?: boolean;
  children: React.ReactNode;
}) {
  const fond = parseHex(values.COULEUR_FOND || "", "#F4EDE3");
  const accent = parseHex(values.COULEUR_ACCENT || "", "#C4A574");
  const texte = parseHex(values.COULEUR_TEXTE || "", "#2A2118");
  const light = isLightHex(fond);
  const host = (values.MARQUE || "studio").toLowerCase().replace(/[^a-z0-9]+/g, "") || "studio";
  const line = light ? `${texte}14` : `${texte}22`;

  return (
    <div
      className="relative overflow-hidden rounded-[16px]"
      style={{
        background: fond,
        color: texte,
        border: `1px solid ${line}`,
        boxShadow: `0 28px 64px -36px ${texte}66`,
      }}
    >
      {shine ? (
        <ShineBorder shineColor={[fond, accent, fond]} duration={18} borderWidth={1} />
      ) : null}
      <div className="flex h-8 items-center gap-2 px-3" style={{ borderBottom: `1px solid ${line}` }}>
        <span className="flex gap-1" aria-hidden>
          <i className="size-2 rounded-full" style={{ background: light ? "#E8B4A0" : "#5a4038" }} />
          <i className="size-2 rounded-full" style={{ background: light ? "#C4A574" : "#8a7048" }} />
          <i className="size-2 rounded-full" style={{ background: light ? "#8FAE8B" : "#3d5a42" }} />
        </span>
        <span
          className="min-w-0 flex-1 truncate rounded-md px-2 py-0.5 text-center font-mono text-[10px]"
          style={{ background: light ? `${texte}0d` : `${texte}18`, color: `${texte}99` }}
        >
          https://{host}.com
        </span>
      </div>
      {children}
    </div>
  );
}

/** Capture type landing (chrome navigateur + page réelle), originale — pas un scrape. */
export function HeroCapture({ hero, shine = false }: { hero: HeroCard; shine?: boolean }) {
  const values = defaultValues(hero);
  return (
    <HeroFrame values={values} shine={shine}>
      <div className="pointer-events-none relative aspect-[16/10] overflow-hidden">
        {hero.apercuVideoUrl ? (
          <video
            src={hero.apercuVideoUrl}
            poster={hero.apercuPosterUrl || undefined}
            muted
            playsInline
            loop
            autoPlay
            className="absolute inset-0 size-full object-cover"
          />
        ) : hero.apercuPosterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={hero.apercuPosterUrl} alt="" className="absolute inset-0 size-full object-cover" />
        ) : (
          <HeroPreview slug={hero.slug} values={values} capture />
        )}
      </div>
    </HeroFrame>
  );
}

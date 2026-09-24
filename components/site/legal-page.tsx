/** Page légale : titre, date de mise à jour, sections. `[À compléter]` repère les infos à remplir. */
export function LegalPage({
  title,
  updated,
  sections,
}: {
  title: string;
  updated: string;
  sections: { h: string; p: string[] }[];
}) {
  return (
    <article className="mx-auto max-w-[720px] px-5 pt-14 pb-20 sm:px-8 sm:pt-20">
      <p className="mono-label">/ Légal ///</p>
      <h1 className="mt-3 font-display text-[clamp(32px,5vw,46px)] leading-[1.05] font-semibold tracking-tightest">
        {title}
      </h1>
      <p className="mt-3 text-[14px] text-muted-foreground">Mise à jour : {updated}</p>
      <div className="mt-10 flex flex-col gap-8">
        {sections.map((s) => (
          <section key={s.h} className="flex flex-col gap-3">
            <h2 className="text-[19px] font-semibold tracking-[-0.02em]">{s.h}</h2>
            {s.p.map((t) => (
              <p key={t} className="text-[15px] leading-relaxed text-ink/75">
                {t.split(/(\[À compléter[^\]]*\])/).map((part, i) =>
                  part.startsWith("[À compléter") ? (
                    <mark key={i} className="rounded-[4px] bg-st-pause-soft px-1 text-st-pause-ink">
                      {part}
                    </mark>
                  ) : (
                    part
                  ),
                )}
              </p>
            ))}
          </section>
        ))}
      </div>
    </article>
  );
}

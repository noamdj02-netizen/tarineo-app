/** Page légale : titre, date de mise à jour, sections. */
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
    <article className="landing-v2 mx-auto max-w-[720px] px-5 pb-20 pt-6 sm:px-8 sm:pt-10">
      <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-tarineo-orange">
        Légal
      </p>
      <h1 className="mt-3 text-balance text-[clamp(2rem,4vw,2.75rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-ink-900">
        {title}
      </h1>
      <p className="mt-3 text-[14px] font-medium text-ink-400">Mise à jour : {updated}</p>
      <div className="mt-10 flex flex-col gap-8">
        {sections.map((s) => (
          <section key={s.h} className="flex flex-col gap-3">
            <h2 className="text-[19px] font-semibold tracking-[-0.02em] text-ink-900">{s.h}</h2>
            {s.p.map((t) => (
              <p key={t} className="text-[15px] leading-relaxed text-ink-600">
                {t.split(/(\[À compléter[^\]]*\])/).map((part, i) =>
                  part.startsWith("[À compléter") ? (
                    <mark key={i} className="rounded-[4px] bg-tarineo-orange/15 px-1 text-ink-800">
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

import { Fragment } from "react";
import { LucideByName } from "@/components/icons/lucide-by-name";
import { Checklist } from "@/components/kit/checklist";
import { Reveal } from "@/components/motion/reveal";
import { PageHead } from "@/components/shell/page-head";
import { FRAMES, ZONES } from "@/lib/design-data/frames";

export const metadata = { title: "Anatomie" };

const FUNNEL = [
  { cls: "zA", icon: "eye", n: "Attention", s: "Frames 1–3 · tout le monde les voit" },
  { cls: "zI", icon: "lightbulb", n: "Intérêt", s: "Frames 4–6 · il comprend l'utilité" },
  { cls: "zD", icon: "heart", n: "Désir", s: "Frames 7–9 · il se projette et a confiance" },
  { cls: "zX", icon: "mouse-pointer-click", n: "Action", s: "Frames 10–12 · il lève ses doutes et clique" },
];

export default function AnatomiePage() {
  return (
    <section>
      <PageHead label="Anatomie" title="Une landing =" tail="un tunnel de 12 frames.">
        {
          "Chaque frame a un seul rôle. Le visiteur descend et on lui fait passer 4 étapes : il remarque, il comprend, il a envie, il clique. Plus on descend, moins il reste de monde, donc le haut de page compte le plus."
        }
      </PageHead>
      <div className="funnel">
        {FUNNEL.map((z) => (
          <div key={z.cls} className={`fz ${z.cls}`}>
            <b>
              <LucideByName name={z.icon} />
              {z.n}
            </b>
            <span>{z.s}</span>
          </div>
        ))}
      </div>
      <div>
        {FRAMES.map((f, i) => {
          const z = ZONES[f.z];
          return (
            <Fragment key={f.n}>
              <Reveal>
                <article className="frame" style={{ "--hot": z.c } as React.CSSProperties}>
                  <div className="fleft">
                    <div className="fhead">
                      <span className="fnum" style={{ background: z.s, color: z.c }}>
                        {String(i + 1).padStart(2, "0")} · {z.n}
                      </span>
                    </div>
                    <div className="fhead">
                      <span className="note">
                        <span className="ic" style={{ background: z.s, color: z.c }}>
                          <LucideByName name={f.ic} />
                        </span>
                      </span>
                      <h3>{f.n}</h3>
                    </div>
                    <div className="browser" aria-hidden>
                      <div className="chrome">
                        <i />
                        <i />
                        <i />
                      </div>
                      {/* maquette fil de fer d'origine (données statiques) */}
                      <div className="wf" dangerouslySetInnerHTML={{ __html: f.w }} />
                    </div>
                  </div>
                  <div className="fright">
                    <Note cls="full" tone="b" icon="target" h="Rôle" p={f.role} />
                    <Note tone="g" icon="check" h="Règle d’or" p={f.rule} />
                    <Note tone="r" icon="x" h="Erreur fréquente" p={f.err} />
                    <Note cls="full" tone="y" icon="pencil-line" h="Exemple Tarineo" p={f.ex} />
                    {f.pins.length ? (
                      <div className="pins">
                        {f.pins.map((p, j) => (
                          <div key={p}>
                            <span className="pin" style={{ "--hot": z.c } as React.CSSProperties}>
                              {j + 1}
                            </span>
                            {p}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </article>
              </Reveal>
              {i < FRAMES.length - 1 ? (
                <div className="conn flex items-center gap-2.5 py-2 pl-6 text-[13px] text-muted" aria-hidden>
                  <span className="line" />
                  <LucideByName name="arrow-down" />
                  scroll
                </div>
              ) : null}
            </Fragment>
          );
        })}
      </div>
      <Checklist />
    </section>
  );
}

function Note({
  cls = "",
  tone,
  icon,
  h,
  p,
}: {
  cls?: string;
  tone: "b" | "g" | "r" | "y";
  icon: string;
  h: string;
  p: string;
}) {
  return (
    <div className={`note ${cls}`}>
      <span className={`ic ${tone}`}>
        <LucideByName name={icon} />
      </span>
      <div>
        <h4>{h}</h4>
        <p>{p}</p>
      </div>
    </div>
  );
}

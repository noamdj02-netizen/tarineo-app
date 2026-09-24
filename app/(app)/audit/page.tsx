import { OctagonAlert } from "lucide-react";
import { LucideByName } from "@/components/icons/lucide-by-name";
import { Reveal, RevealGroup } from "@/components/motion/reveal";
import { PageHead } from "@/components/shell/page-head";
import { SITES, STATES } from "@/lib/design-data/audit";
import { FRAMES } from "@/lib/design-data/frames";

export const metadata = { title: "Mes sites" };

export default function AuditPage() {
  return (
    <section>
      <PageHead label="Mes sites" title="Audit de tes 3 sites," tail="face aux 12 frames.">
        {
          "Chaque site est comparé aux 12 frames. Vert = présent, orange = à améliorer, rouge = manquant. Audit fait sur le contenu public des pages le 24/09/2026."
        }
      </PageHead>
      <RevealGroup className="sites" stagger={0.08}>
        {SITES.map((s) => {
          const ok = s.s.filter((x) => x === "ok").length;
          return (
            <Reveal key={s.n} className="site">
              <div className="site-h">
                <div>
                  <h3>{s.n}</h3>
                  <a href={s.u} target="_blank" rel="noopener noreferrer">
                    {s.u.replace("https://", "")}
                  </a>
                </div>
                <div className="score">
                  {ok}
                  <small>/ 12 frames OK</small>
                </div>
              </div>
              {s.alert ? (
                <div className="alert" role="alert">
                  <OctagonAlert aria-hidden />
                  <div>
                    <b>Urgent</b>
                    <br />
                    {s.alert}
                  </div>
                </div>
              ) : null}
              <div className="site-b">
                <div>
                  <div className="eyebrow" style={{ marginBottom: 6 }}>
                    Les 12 frames
                  </div>
                  {FRAMES.map((f, i) => {
                    const [bg, color, icon, label] = STATES[s.s[i]];
                    return (
                      <div key={f.n} className="st">
                        <span className="dot" style={{ background: bg, color }}>
                          <LucideByName name={icon} />
                        </span>
                        {String(i + 1).padStart(2, "0")} {f.n}
                        <span
                          style={{ marginLeft: "auto", color, font: "500 12px var(--f-mono)" }}
                        >
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div>
                  <div className="eyebrow" style={{ marginBottom: 6 }}>
                    4 actions, dans l’ordre
                  </div>
                  {s.fx.map((x, i) => (
                    <div key={x} className="fix">
                      <span className="n">{i + 1}</span>
                      <span>{x}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          );
        })}
      </RevealGroup>
    </section>
  );
}

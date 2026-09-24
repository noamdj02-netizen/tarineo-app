import { ArrowRight, Blocks, Copy } from "lucide-react";
import Link from "next/link";
import { CopyButton } from "@/components/kit/copy-button";
import { Reveal, RevealGroup } from "@/components/motion/reveal";
import { PreLandingLibrary } from "@/components/prelanding/pre-landing-library";
import { PREVIEWS } from "@/components/prelanding/previews";
import { PageHead } from "@/components/shell/page-head";
import { swatches, THEMES, tokens } from "@/lib/design-data/themes";
import { KIT_FONTS_URL } from "@/lib/kit";
import { PRE_LANDING_TEMPLATES } from "@/lib/prelanding/templates";
import { listProjects } from "@/lib/projects/queries";

export const metadata = { title: "Pre-Landing Pages" };

export default async function ThemesPage() {
  const projects = await listProjects();
  const previews = Object.fromEntries(
    PRE_LANDING_TEMPLATES.map((t) => {
      const Preview = PREVIEWS[t.id];
      return [t.id, Preview ? <Preview /> : null];
    }),
  );

  return (
    <section>
      <link rel="stylesheet" href={KIT_FONTS_URL} precedence="default" />
      <PreLandingLibrary
        header={
          <PageHead label="Pre-landing library" title="Pre-Landing" tail="Pages">
            Choose a structure. Customize it. Ship faster.
          </PageHead>
        }
        previews={previews}
        projects={projects.map((p) => ({ id: p.id, name: p.name, focus: p.status === "focus" }))}
      />

      <div className="mt-20 mb-6 flex flex-col gap-2 border-t border-line pt-10">
        <p className="mono-label">/ Thèmes ///</p>
        <h2 className="font-display text-[clamp(24px,4.5vw,32px)] leading-[1.05] font-semibold tracking-tightest">
          6 thèmes <span className="text-accent-2">prêts à copier.</span>
        </h2>
        <p className="max-w-[62ch] text-[15.5px] leading-relaxed text-muted">
          Chaque thème = couleurs, typos, arrondis et ombres. Une pre-landing donne la structure, le
          thème donne le style.
        </p>
      </div>
      <RevealGroup className="tgrid" stagger={0.05}>
        {THEMES.map((t) => (
          <Reveal key={t.id} className="tcard">
            <div className="kit tpreview" data-kit={t.id} aria-hidden>
              <span className="k-pill">
                <b>Nouveau</b> Thème {t.n}
              </span>
              <h2 className="k-h">Le bon prix, sur chaque devis.</h2>
              <div className="k-row">
                <span className="k-btn k-primary">
                  Commencer <ArrowRight />
                </span>
                <span className="k-btn k-second">Démo</span>
              </div>
            </div>
            <div className="tmeta">
              <div>
                <h3>{t.n}</h3>
                <div className="for">{t.f}</div>
              </div>
              <div className="sws">
                {swatches(t.id).map((s) => (
                  <span key={s.v}>
                    <i style={{ background: s.c }} />
                    {s.c.startsWith("rgba") ? "rgba" : s.c}
                  </span>
                ))}
              </div>
              <div className="tfont">
                <b>Typos :</b> {t.fonts}
              </div>
              <div className="tbtns">
                <CopyButton text={tokens(t.id)}>
                  <Copy aria-hidden />
                  Copier les tokens
                </CopyButton>
                <Link className="copy" href={`/composants?theme=${t.id}`}>
                  <Blocks aria-hidden />
                  Voir les composants
                </Link>
              </div>
            </div>
          </Reveal>
        ))}
      </RevealGroup>
    </section>
  );
}

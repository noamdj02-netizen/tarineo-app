import { ArrowRight, Blocks, Copy } from "lucide-react";
import Link from "next/link";
import { CopyButton } from "@/components/kit/copy-button";
import { Reveal, RevealGroup } from "@/components/motion/reveal";
import { PageHead } from "@/components/shell/page-head";
import { swatches, THEMES, tokens } from "@/lib/design-data/themes";
import { KIT_FONTS_URL } from "@/lib/kit";

export const metadata = { title: "Thèmes" };

export default function ThemesPage() {
  return (
    <section>
      <link rel="stylesheet" href={KIT_FONTS_URL} precedence="default" />
      <PageHead label="Thèmes" title="6 thèmes" tail="prêts à copier.">
        {
          "Chaque thème = couleurs, typos, arrondis et ombres. Un par projet, plus deux thèmes libres. Style Dribbble/Behance : une couleur d'accent forte, beaucoup d'espace, une typo de titre avec du caractère."
        }
      </PageHead>
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

import { CircleX, Lightbulb } from "lucide-react";
import { Reveal, RevealGroup } from "@/components/motion/reveal";
import { CopyButton } from "@/components/kit/copy-button";
import { RulesGenerator } from "@/components/kit/rules-generator";
import { PageHead } from "@/components/shell/page-head";
import { FLOW, FLOW_PROMPT } from "@/lib/design-data/workflow";

export const metadata = { title: "Figma → Cursor" };

export default function WorkflowPage() {
  return (
    <section>
      <PageHead label="Figma → Cursor" title="Figma → Cursor," tail="sans perte.">
        {
          "Pourquoi le code ne ressemble jamais à ta maquette, et la méthode en 7 étapes pour que ça marche."
        }
      </PageHead>
      <div className="why">
        <h3>
          <CircleX aria-hidden />
          Pourquoi ça rate aujourd’hui
        </h3>
        <ul>
          <li>Tu donnes une capture d’écran : l’IA devine les tailles, les couleurs et les espacements.</li>
          <li>Pas de variables dans Figma : l’IA invente des valeurs en dur différentes à chaque écran.</li>
          <li>Pas d’Auto Layout : l’IA ne sait pas comment la page doit se comporter sur mobile.</li>
          <li>Tu demandes toute la page d’un coup : trop d’infos, l’IA simplifie.</li>
        </ul>
      </div>
      <RevealGroup className="steps" stagger={0.05}>
        {FLOW.map(([h, p, x], i) => (
          <Reveal key={h} className="stp">
            <div className="rail">
              <span className="num">{i + 1}</span>
              {i < FLOW.length - 1 ? <i /> : null}
            </div>
            <div className="body">
              <h4>{h}</h4>
              <p>{p}</p>
              {x === "RULES" ? (
                <RulesGenerator />
              ) : x === "PROMPT" ? (
                <>
                  <div className="codehead">
                    <span className="hint">Prompt type</span>
                    <CopyButton text={FLOW_PROMPT} />
                  </div>
                  <pre className="code">{FLOW_PROMPT}</pre>
                </>
              ) : x ? (
                <div className="tip">
                  <Lightbulb aria-hidden />
                  {x}
                </div>
              ) : null}
            </div>
          </Reveal>
        ))}
      </RevealGroup>
    </section>
  );
}

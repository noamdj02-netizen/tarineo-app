import type { WorkflowNode } from "@/lib/site/landing-v2-content";
import { Icon } from "./Icon";

const toneClasses: Record<NonNullable<WorkflowNode["tone"]>, string> = {
  plain: "bg-paper-50 text-ink-400 border border-line",
  ai: "bg-accent-soft text-accent-700",
  accent: "bg-accent text-white",
};

/**
 * Plan de workflow vertical : chaque étape est une petite carte, reliée à la
 * suivante par un trait dont le segment actif est orange. C'est le motif
 * narratif de la page, emprunté aux nœuds d'automatisation du dashboard.
 */
export function Workflow({
  nodes,
  className = "",
}: {
  nodes: WorkflowNode[];
  className?: string;
}) {
  return (
    <ol className={`flex flex-col ${className}`}>
      {nodes.map((node, index) => {
        const isLast = index === nodes.length - 1;

        return (
          <li key={node.title} className="relative pb-7 pl-16 last:pb-0">
            {!isLast ? (
              <>
                <span aria-hidden="true" className="absolute top-11 bottom-1 left-[19px] w-px bg-line" />
                <span
                  aria-hidden="true"
                  data-reveal-line
                  className="absolute top-11 bottom-1 left-[19px] w-px bg-accent"
                />
              </>
            ) : null}

            <span
              data-reveal-node
              className={`absolute top-0 left-0 inline-flex h-10 w-10 items-center justify-center rounded-sm ${
                toneClasses[node.tone ?? "plain"]
              }`}
            >
              <Icon name={node.icon} className="h-5 w-5" />
            </span>

            <div data-reveal-node className="pt-1">
              <p className="text-[0.9375rem] font-medium text-ink-900">{node.title}</p>
              {node.meta ? <p className="mt-0.5 text-sm text-ink-400">{node.meta}</p> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
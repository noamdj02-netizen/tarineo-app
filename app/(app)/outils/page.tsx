import { ChevronDown, Workflow } from "lucide-react";
import { LucideByName } from "@/components/icons/lucide-by-name";
import { Reveal, RevealGroup } from "@/components/motion/reveal";
import { PageHead } from "@/components/shell/page-head";
import { FigmaMethod } from "@/components/workflow/figma-method";
import { TOOL_GROUPS, TOOL_LOGOS } from "@/lib/design-data/tools";
import { safeUrl } from "@/lib/projects/types";

export const metadata = { title: "Outils" };

export default function OutilsPage() {
  return (
    <section>
      <PageHead
        art="dashboard-depenses"
        label="Outils"
        title="Tes outils,"
        tail="rangés par étape."
      >
        Tous tes logiciels avec leurs vrais logos, rangés par étape de création
        d’un SaaS. Le badge « Claude ✓ » veut dire que Claude peut déjà s’y
        connecter.
      </PageHead>
      <div className="flex flex-col gap-7">
        {TOOL_GROUPS.map(([group, icon, tools]) => (
          <RevealGroup
            key={group}
            stagger={0.035}
            className="flex flex-col gap-3"
          >
            <Reveal>
              <h2 className="flex items-center gap-2 text-[18px] font-semibold tracking-[-0.02em]">
                <span className="grid size-8 place-items-center rounded-lg bg-accent-soft">
                  <LucideByName name={icon} className="size-4" />
                </span>
                {group}
              </h2>
            </Reveal>
            <div className="grid gap-2.5 sm:grid-cols-[repeat(auto-fill,minmax(240px,1fr))]">
              {tools.map(([name, url, , desc, connected]) => {
                const href = safeUrl(url);
                const logo = TOOL_LOGOS[name];
                return (
                  <Reveal key={name}>
                    <a
                      href={href ?? undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="card-soft group flex h-full items-center gap-3 p-3 transition-[transform,box-shadow] duration-300 ease-out-soft hover:-translate-y-0.5 hover:shadow-lift"
                    >
                      <span className="grid size-11 flex-none place-items-center overflow-hidden rounded-xl bg-white shadow-soft">
                        {logo ? (
                          // eslint-disable-next-line @next/next/no-img-element -- logos en data URI d'origine
                          <img
                            src={logo}
                            alt=""
                            width={24}
                            height={24}
                            className="size-6 object-contain"
                            loading="lazy"
                          />
                        ) : (
                          <span className="btn-dark grid size-11 place-items-center rounded-xl text-[15px] font-bold">
                            {name.charAt(0)}
                          </span>
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <b className="block text-[15px] font-semibold">
                          {name}
                        </b>
                        <small className="block text-[13px] leading-snug text-muted">
                          {desc}
                        </small>
                      </span>
                      {connected ? (
                        <span className="self-start rounded-md bg-ink px-1.5 py-0.5 font-mono text-[10px] whitespace-nowrap text-accent-ink">
                          Claude ✓
                        </span>
                      ) : null}
                    </a>
                  </Reveal>
                );
              })}
            </div>
          </RevealGroup>
        ))}
      </div>

      <details
        id="figma-cursor"
        className="group mt-12 border-t border-line pt-8"
      >
        <summary className="flex min-h-11 cursor-pointer list-none items-center gap-3 [&::-webkit-details-marker]:hidden">
          <span className="grid size-8 place-items-center rounded-lg bg-accent-soft">
            <Workflow className="size-4" aria-hidden />
          </span>
          <span className="flex-1">
            <b className="block text-[18px] font-semibold tracking-[-0.02em]">
              Figma → Cursor, sans perte
            </b>
            <small className="block text-[13.5px] text-muted">
              Pourquoi le code ne ressemble jamais à ta maquette, et la méthode
              en 7 étapes.
            </small>
          </span>
          <ChevronDown
            className="size-5 text-muted transition-transform duration-300 group-open:rotate-180"
            aria-hidden
          />
        </summary>
        <div className="mt-6">
          <FigmaMethod />
        </div>
      </details>
    </section>
  );
}

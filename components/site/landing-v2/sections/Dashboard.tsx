"use client";

import {
  LANDING_PRODUCT_CHROME,
  LANDING_PRODUCT_SIDEBAR,
} from "@/lib/site/landing-app-nav-demo";
import { dashboardKpis, dashboardTodo } from "@/lib/site/landing-v2-content";
import { Badge } from "@/components/site/landing-v2/components/ui/Badge";
import { Icon } from "@/components/site/landing-v2/components/ui/Icon";
import { Logo } from "@/components/site/landing-v2/components/layout/Logo";
import { Mascot } from "@/components/site/landing-v2/components/ui/Mascot";
import { SectionHeading, SectionLabel } from "@/components/site/landing-v2/components/ui/SectionLabel";
import {
  LandingFloatCard,
  LandingStagger,
  LandingStaggerItem,
} from "@/components/site/landing-v2/lib/landing-motion";

export function Dashboard({
  embedded = false,
  bare = false,
}: {
  embedded?: boolean;
  /** Sans chrome fenêtre (déjà fourni par `LandingProductFrame`). */
  bare?: boolean;
}) {
  const chrome = LANDING_PRODUCT_CHROME;
  const body = (
            <div className="grid lg:grid-cols-[17rem_minmax(0,1fr)]">
              {/* Barre latérale */}
              <aside className="hidden border-r border-line bg-paper-0 p-5 lg:block">
                <Logo markClassName="h-7 w-7" />
                <nav aria-label="Navigation du produit" className="mt-7 flex flex-col gap-6">
                  {LANDING_PRODUCT_SIDEBAR.map((group) => (
                    <div key={group.title}>
                      <p className="eyebrow">{group.title}</p>
                      <ul className="mt-2.5 flex flex-col gap-0.5">
                        {group.items.map((item) => (
                          <li key={`${group.title}-${item.label}`}>
                            <span
                              className={`flex items-center gap-2.5 rounded-md py-2 text-sm ${
                                item.nested ? "pl-7 pr-2.5 text-[0.8125rem]" : "px-2.5"
                              } ${
                                item.active
                                  ? "bg-accent-soft font-medium text-accent-700"
                                  : item.nested
                                    ? "text-ink-500"
                                    : "text-ink-600"
                              }`}
                            >
                              {!item.nested ? (
                                <Icon name={item.icon} className="h-4 w-4 shrink-0" />
                              ) : (
                                <span className="h-4 w-4 shrink-0" aria-hidden />
                              )}
                              {item.label}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </nav>
              </aside>

              {/* Contenu */}
              <div className="min-w-0 bg-paper-100 p-5 sm:p-7">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <nav aria-label="Fil d'ariane" className="flex items-center gap-2 text-xs text-ink-400">
                    {chrome.breadcrumb.map((crumb, index) => (
                      <span key={crumb} className="contents">
                        {index > 0 ? <span aria-hidden="true">/</span> : null}
                        <span className={index === chrome.breadcrumb.length - 1 ? "text-ink-900" : undefined}>
                          {crumb}
                        </span>
                      </span>
                    ))}
                  </nav>
                  <span className="inline-flex items-center rounded-full bg-accent px-4 py-2 text-sm font-medium text-white">
                    {chrome.primaryCta}
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-ink-900">{chrome.pageTitle}</h3>
                    <p className="mt-1 text-sm text-ink-400">{chrome.pageMeta}</p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-success-soft px-3 py-1.5 text-sm font-medium text-success">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
                    {chrome.status}
                  </span>
                </div>

                {/* KPI : rail horizontal sur mobile, grille sur desktop */}
                <LandingStagger
                  className="rail mt-6 min-w-0 sm:grid sm:grid-cols-2 sm:gap-3 lg:grid-cols-4"
                  stagger={0.06}
                >
                  {dashboardKpis.map((kpi) => (
                    <LandingStaggerItem
                      key={kpi.label}
                      className={`surface-flat w-[13rem] p-4 transition-shadow duration-200 hover:shadow-card sm:w-auto ${
                        kpi.tone === "accent" ? "border-accent-100" : ""
                      }`}
                    >
                      <p className="flex items-center gap-2 text-sm text-ink-400">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            kpi.tone === "accent" ? "bg-accent" : "bg-ink-300"
                          }`}
                          aria-hidden="true"
                        />
                        {kpi.label}
                      </p>
                      <p className="mt-2.5 text-lg font-semibold text-ink-900 nums">{kpi.value}</p>
                      <p className="mt-1 text-xs text-ink-400">{kpi.detail}</p>
                    </LandingStaggerItem>
                  ))}
                </LandingStagger>

                <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
                  <div className="surface-flat overflow-hidden">
                    <div className="flex items-center justify-between border-b border-line px-5 py-4">
                      <SectionLabel>{chrome.todoSection}</SectionLabel>
                      <span className="text-sm text-ink-400 nums">3</span>
                    </div>
                    <ul>
                      {dashboardTodo.map((item) => (
                        <li
                          key={item.title}
                          className="flex items-center gap-4 border-b border-line px-5 py-4 transition-colors duration-200 last:border-b-0 hover:bg-paper-50"
                        >
                          <Badge tone={item.kind === "Action" ? "accent" : "muted"} dot>
                            {item.kind}
                          </Badge>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-ink-900">{item.title}</p>
                            <p className="mt-0.5 truncate text-sm text-ink-400">{item.detail}</p>
                          </div>
                          <span aria-hidden="true" className="text-ink-300">
                            →
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="surface-flat relative overflow-hidden p-5">
                    <p className="eyebrow">{chrome.todaySection}</p>
                    <p className="mt-2 text-lg font-semibold text-ink-900">{chrome.todayGreeting}</p>
                    <p className="mt-1 max-w-[8.5rem] text-sm text-ink-400">{chrome.todayQuestion}</p>
                    <Mascot
                      name="salut"
                      size={104}
                      alt="La mascotte Tarinéo qui salue dans le dashboard"
                      className="absolute -right-2 -bottom-2"
                    />
                  </div>
                </div>
              </div>
            </div>
  );

  const chromeBar = (
    <div className="flex items-center gap-3 border-b border-line px-4 py-3 sm:px-5">
      <span className="flex gap-1.5" aria-hidden="true">
        <span className="h-2.5 w-2.5 rounded-full bg-paper-200" />
        <span className="h-2.5 w-2.5 rounded-full bg-paper-200" />
        <span className="h-2.5 w-2.5 rounded-full bg-paper-200" />
      </span>
      <span className="mx-auto flex items-center gap-2 rounded-full bg-paper-50 px-3.5 py-1.5 text-xs text-ink-400">
        <Icon name="loupe" className="h-3.5 w-3.5" />
        {chrome.searchPlaceholder}
        <span className="rounded border border-line px-1.5 py-0.5 text-[0.625rem]">
          {chrome.searchShortcut}
        </span>
      </span>
    </div>
  );

  const inner = bare ? (
    body
  ) : (
    <LandingFloatCard
      className={embedded ? "surface overflow-hidden shadow-float" : "mt-14 surface overflow-hidden shadow-float"}
      delay={0.1}
    >
      {chromeBar}
      {body}
    </LandingFloatCard>
  );

  if (embedded) return inner;

  return (
    <section id="produit-legacy" className="py-20 sm:py-28">
      <div className="shell">
        <SectionHeading
          label="Le dashboard"
          title={
            <>
              Tout ce qui mérite votre attention.
              <span className="mt-2 block text-ink-400">Au même endroit.</span>
            </>
          }
          subtitle="Le même produit, à l'écran : ce qui est en retard, ce qui a bougé, ce qui attend votre accord."
        />
        {inner}
      </div>
    </section>
  );
}

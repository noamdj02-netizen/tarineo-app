import { OctagonAlert } from "lucide-react";
import Link from "next/link";
import { ConnectorsBoard } from "@/components/connectors/connectors-board";
import { SitesBoard, type SiteCard } from "@/components/audit/sites-board";
import { LucideByName } from "@/components/icons/lucide-by-name";
import { Reveal, RevealGroup } from "@/components/motion/reveal";
import { PageHead } from "@/components/shell/page-head";
import { isOwner } from "@/lib/billing/plan";
import { loadConnectorSignals } from "@/lib/connectors/signals";
import { getDb } from "@/lib/db";
import { EMPTY_CRITIQUE, normalizeCritique } from "@/lib/audit/critique";
import { normalizeFrames } from "@/lib/audit/score";
import { SITES, STATES } from "@/lib/design-data/audit";
import { FRAMES } from "@/lib/design-data/frames";

export const metadata = { title: "Mes sites" };

export default async function AuditPage() {
  const [db, signals] = await Promise.all([getDb(), loadConnectorSignals()]);
  const owner = isOwner(db?.user.email);

  let sites: SiteCard[] = [];
  let drafts: { slug: string; name: string }[] = [];
  if (db) {
    const first = await db.supabase
      .from("projects")
      .select("id, slug, name, site, audit_frames, audit_critique")
      .eq("user_id", db.user.id)
      .order("sort_order");
    const rows =
      first.error
        ? (
            await db.supabase
              .from("projects")
              .select("id, slug, name, site")
              .eq("user_id", db.user.id)
              .order("sort_order")
          ).data
        : first.data;
    const all = rows ?? [];
    drafts = all.filter((p) => !p.site?.trim()).map((p) => ({ slug: p.slug, name: p.name }));
    sites = all
      .filter((p) => p.site?.trim())
      .map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        site: p.site,
        frames: normalizeFrames("audit_frames" in p ? p.audit_frames : []),
        critique: normalizeCritique(
          "audit_critique" in p ? p.audit_critique : EMPTY_CRITIQUE,
        ),
      }));
  }

  return (
    <section>
      <PageHead art="dashboard-analyse" label="Mes sites" title="Le score de tes landings," tail="page atelier.">
        Critique 5 axes, 12 frames, film. Clique le nom pour ouvrir la page
        projet (marketing, landing, schéma).
      </PageHead>

      {drafts.length ? (
        <div className="mb-10">
          <p className="mono-label mb-3">{`/ Sans landing ///`}</p>
          <ul className="grid gap-2.5 sm:grid-cols-2">
            {drafts.map((d) => (
              <li key={d.slug} className="card-soft flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-[15px] font-semibold">{d.name}</p>
                  <p className="text-[13px] text-muted-foreground">Pas d’URL. Colle un hero d’abord.</p>
                </div>
                <Link
                  href={`/projets/${d.slug}`}
                  className="btn-dark inline-flex min-h-10 items-center rounded-pill px-3.5 text-[13px] font-medium"
                >
                  Ouvrir
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="mono-label mb-4">{`/ Tes sites ///`}</p>
      <SitesBoard sites={sites} />

      <div className="mt-10">
        <p className="mono-label mb-4">{`/ Connecteurs ///`}</p>
        <ConnectorsBoard initial={signals} compact />
      </div>

      {owner ? (
        <div className="mt-12">
          <p className="mono-label mb-4">{`/ Référence studio ///`}</p>
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
        </div>
      ) : null}
    </section>
  );
}

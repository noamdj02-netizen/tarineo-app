import Link from "next/link";
import type { ChantierCard, DocumentCard, PriceAlert } from "@/lib/metier/types";
import { signedPct, variation } from "@/lib/site/tarineo";

export function PendingDocsWidget({ docs }: { docs: DocumentCard[] }) {
  return (
    <section className="card-soft p-4" data-tour="actions">
      <p className="mono-label mb-2">{"/ À traiter ///"}</p>
      {docs.length ? (
        <ul className="grid gap-2">
          {docs.slice(0, 4).map((d) => (
            <li key={d.id} className="flex items-baseline justify-between gap-2 text-[14px]">
              <span className="min-w-0 truncate font-medium">{d.title}</span>
              <Link href="/ressources" className="shrink-0 text-[13px] underline underline-offset-2">
                Transformer
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[13.5px] text-muted-foreground">Rien en attente. Déposez un devis.</p>
      )}
    </section>
  );
}

export function HaussesWidget({ alerts }: { alerts: PriceAlert[] }) {
  return (
    <section className="card-soft p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="mono-label">{"/ Hausses ///"}</p>
        <Link href="/schemas" className="text-[12.5px] underline underline-offset-2">
          Tout voir
        </Link>
      </div>
      {alerts.length ? (
        <ul className="grid gap-2">
          {alerts.slice(0, 3).map((a) => (
            <li key={a.id} className="flex items-baseline justify-between gap-2 text-[14px]">
              <span className="min-w-0 truncate">
                {a.label}
              </span>
              <span className="shrink-0 tabular-nums text-brand-orange">
                {signedPct(variation(Number(a.old_price), Number(a.new_price)))}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[13.5px] text-muted-foreground">Pas encore de hausse relevée.</p>
      )}
    </section>
  );
}

export function ChantiersWidget({ chantiers }: { chantiers: ChantierCard[] }) {
  return (
    <section className="card-soft p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="mono-label">{"/ Chantiers ///"}</p>
        <Link href="/projets" className="text-[12.5px] underline underline-offset-2">
          Tous
        </Link>
      </div>
      {chantiers.length ? (
        <ul className="grid gap-2">
          {chantiers.slice(0, 5).map((c) => (
            <li key={c.id}>
              <Link href={`/projets/${c.slug}`} className="flex items-baseline justify-between gap-2 text-[14px]">
                <span className="min-w-0 truncate font-medium">{c.name}</span>
                <span className="shrink-0 text-[12.5px] text-muted-foreground">
                  {c.status === "focus" ? "En cours" : c.status} · {c.docs_count}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[13.5px] text-muted-foreground">Ouvrez un chantier.</p>
      )}
    </section>
  );
}

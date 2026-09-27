import Link from "next/link";
import { PageHead } from "@/components/shell/page-head";
import { DEMO_IDS } from "@/lib/metier/demo";
import { listAlerts } from "@/lib/metier/queries";
import { R } from "@/lib/routes";
import { APP_PAGES } from "@/lib/site/app-pages";
import { DEMO_MARK, euro, signedPct, variation } from "@/lib/site/tarineo";

export const metadata = { title: "Hausses" };

export default async function AlertesPage() {
  const alerts = await listAlerts();
  const p = APP_PAGES.alertes;
  return (
    <section className="flex flex-col gap-8">
      <PageHead mascot="06-loupe" label={p.label} title={p.title} tail={p.tail}>
        {p.text}
      </PageHead>
      {alerts.length ? (
        <ul className="grid gap-3">
          {alerts.map((a) => {
            const pct = variation(Number(a.old_price), Number(a.new_price));
            const demo = a.id === DEMO_IDS.alert;
            return (
              <li key={a.id} className="card-soft flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  {demo ? <p className="text-[11px] text-muted-foreground">{DEMO_MARK}</p> : null}
                  <p className="font-medium">{a.label}</p>
                  <p className="text-[13px] text-muted-foreground">{a.chantier_name ?? "Tous chantiers"}</p>
                  <div className="mt-1 flex flex-wrap gap-3 text-[13px]">
                    {a.document_id ? (
                      <Link href={R.piece(a.document_id)} className="underline underline-offset-2">
                        Pièce
                      </Link>
                    ) : null}
                    {a.chantier_id ? (
                      <Link href={R.chantiers} className="underline underline-offset-2">
                        Chantiers
                      </Link>
                    ) : null}
                    <Link
                      href={`${R.comparateur}?article=${encodeURIComponent(a.label)}`}
                      className="underline underline-offset-2"
                    >
                      Comparer
                    </Link>
                    <Link href={R.distributeurDevis} className="underline underline-offset-2">
                      Documents
                    </Link>
                  </div>
                </div>
                <p className="tabular-nums text-brand-orange">
                  {euro(Number(a.old_price))} → {euro(Number(a.new_price))} ({signedPct(pct)})
                </p>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-[14.5px] text-muted-foreground">
          Pas encore de hausse.{" "}
          <Link href={R.distributeurDevis} className="underline underline-offset-2">
            Déposez un devis
          </Link>{" "}
          pour comparer.
        </p>
      )}
    </section>
  );
}

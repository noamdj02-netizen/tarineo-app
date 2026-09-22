import { INTEGRATIONS_CONNUES, type StatutIntegration } from "@/lib/integrationsConnues";
import { origineActuelle } from "@/lib/origine";
import { cn } from "@/lib/utils";
import { LogoIntegration } from "./LogoIntegration";

function urlRedirection(baseUrl: string, chemin: string): string {
  return chemin ? `${baseUrl}${chemin}` : baseUrl;
}

function BadgeStatut({ statut }: { statut: StatutIntegration }) {
  if (statut === "actif") {
    return (
      <span className="inline-flex shrink-0 items-center rounded-full border border-[var(--app-badge-success-bg)] bg-[var(--app-badge-success-bg)] px-2.5 py-0.5 text-xs font-medium text-[var(--app-badge-success-fg)]">
        Actif
      </span>
    );
  }
  return (
    <span className="inline-flex shrink-0 items-center rounded-full border border-[var(--app-badge-neutral-border)] bg-[var(--app-badge-neutral-bg)] px-2.5 py-0.5 text-xs font-medium text-[var(--app-badge-neutral-fg)]">
      Bientôt
    </span>
  );
}

export async function ParametresIntegrations() {
  const baseUrl = await origineActuelle();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold">Les outils utiles au quotidien</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Connexions pensées pour les artisans : retrouver un client, importer un devis fournisseur et partager avec
          votre comptable — sans ressaisie.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {INTEGRATIONS_CONNUES.filter((int) => int.id !== "pennylane").map((int) => {
          const actif = int.statut === "actif";
          return (
            <div
              key={int.id}
              className="flex flex-col rounded-[20px] border border-[#E6E9EB] bg-white p-5"
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#EEF0F2] bg-white",
                    int.conteneurLogo
                  )}
                >
                  <LogoIntegration
                    nom={int.nom}
                    logo={int.logo}
                    logoLocal={int.logoLocal}
                    couleur={int.couleur}
                    className={int.logoClassName}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-foreground">{int.nom}</h3>
                    <BadgeStatut statut={int.statut} />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{int.desc}</p>
                </div>
              </div>

              <p className="mt-3 text-xs font-medium text-primary">{int.utilite}</p>

              {int.redirections && int.redirections.length > 0 && (
                <div className="mt-3 rounded-xl border border-[#EEF0F2] bg-[#F8F9FA] px-3 py-2.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Configuration externe
                  </p>
                  <ul className="mt-2 space-y-2">
                    {int.redirections.map((redir) => (
                      <li key={`${int.id}-${redir.label}`}>
                        <p className="text-[11px] text-muted-foreground">{redir.label}</p>
                        <code className="mt-0.5 block break-all text-xs font-medium text-foreground">
                          {urlRedirection(baseUrl, redir.chemin)}
                        </code>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                type="button"
                disabled={!actif}
                className={
                  actif
                    ? "mt-4 inline-flex h-10 cursor-default items-center justify-center rounded-full border border-[var(--app-badge-success-bg)] bg-[color-mix(in_srgb,var(--app-badge-success-bg)_14%,white)] px-4 text-sm font-medium text-[#172935]"
                    : "mt-4 inline-flex h-10 cursor-not-allowed items-center justify-center rounded-full border border-[#E6E9EB] px-4 text-sm text-muted-foreground"
                }
              >
                {int.action}
              </button>
            </div>
          );
        })}
      </div>

      <p className="rounded-xl bg-secondary px-4 py-3 text-sm text-muted-foreground">
        <strong className="font-medium text-foreground">INSEE déjà actif :</strong> quand vous créez un devis client,
        la recherche d&apos;entreprise utilise l&apos;API Entreprise — aucune URI à configurer.
        <br />
        <strong className="mt-2 inline-block font-medium text-foreground">Connexion Google :</strong>{" "}
        <code className="break-all text-xs">{baseUrl}/api/auth/callback/google</code>
      </p>
    </div>
  );
}

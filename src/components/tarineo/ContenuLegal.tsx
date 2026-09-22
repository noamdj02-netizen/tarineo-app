import Link from "next/link";
import { PageCard, PageHeader } from "@/components/tarineo/PageHeader";

type Section = { titre: string; contenu: string };

type Props = {
  titre: string;
  intro?: string;
  sections: readonly Section[];
  retourHref?: string;
};

export function ContenuLegal({ titre, intro, sections, retourHref = "/legal" }: Props) {
  return (
    <div className="app-page mx-auto w-full max-w-3xl">
      <PageHeader
        title={titre}
        subtitle={intro}
        backHref={retourHref}
        backLabel="Informations légales"
      />
      <PageCard className="flex flex-col gap-8">
        {sections.map((section) => (
          <section key={section.titre}>
            <h2 className="text-base font-semibold text-foreground">{section.titre}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{section.contenu}</p>
          </section>
        ))}
        <p className="text-sm text-muted-foreground">
          Questions :{" "}
          <a href="mailto:contact@tarineo.com" className="font-medium text-primary hover:opacity-90">
            contact@tarineo.com
          </a>
        </p>
      </PageCard>
    </div>
  );
}

export function HubLegal({ backHref, backLabel = "Retour" }: { backHref?: string; backLabel?: string }) {
  return (
    <div className="app-page mx-auto w-full max-w-3xl">
      <PageHeader
        title="Informations légales"
        subtitle="Documents réglementaires et politiques applicables au service Tarineo."
        backHref={backHref}
        backLabel={backLabel}
      />
      <PageCard>
        <ul className="divide-y divide-border">
          {[
            { href: "/legal/confidentialite", label: "Politique de confidentialité", desc: "Données personnelles et RGPD" },
            { href: "/legal/cgu", label: "Conditions générales d'utilisation", desc: "Règles d'usage du service" },
            { href: "/legal/cgv", label: "Conditions générales de vente", desc: "Abonnements et facturation" },
            { href: "/legal/mentions-legales", label: "Mentions légales", desc: "Éditeur et hébergement" },
            { href: "/legal/cookies", label: "Politique cookies", desc: "Traceurs et session" },
          ].map((page) => (
            <li key={page.href}>
              <Link
                href={page.href}
                className="flex flex-col gap-0.5 py-4 transition-colors hover:text-primary sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="font-medium text-foreground">{page.label}</span>
                <span className="text-sm text-muted-foreground">{page.desc}</span>
              </Link>
            </li>
          ))}
        </ul>
      </PageCard>
    </div>
  );
}

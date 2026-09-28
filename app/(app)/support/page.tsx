import Link from "next/link";
import { PageHead } from "@/components/shell/page-head";
import { BRAND } from "@/lib/brand";

export const metadata = { title: "Support" };

const FAQ = [
  {
    q: "Comment importer un devis fournisseur ?",
    a: "Ouvrez Documents distributeur, puis Importer un document. Reliez ensuite le PDF au chantier concerné.",
  },
  {
    q: "Comment créer un devis client ?",
    a: "Depuis Accueil ou Devis clients, utilisez Nouveau devis. Vous pouvez aussi partir d’un modèle.",
  },
  {
    q: "Comment suivre la marge d’un chantier ?",
    a: "Ouvrez le chantier : le résumé affiche Achats, Devis et Marge à partir de vos documents existants.",
  },
  {
    q: "Comment contacter TARINEO ?",
    a: `Écrivez-nous à ${BRAND.contactEmail}. Nous répondons par e-mail — pas de ticket à créer dans l’app.`,
  },
];

export default function SupportPage() {
  return (
    <section className="mx-auto flex max-w-[720px] flex-col gap-8">
      <PageHead
        label="Support"
        title="Besoin d’aide ?"
        crumbs={[
          { href: "/accueil", label: "Accueil" },
          { label: "Support" },
        ]}
        action={
          <a
            href={`mailto:${BRAND.contactEmail}?subject=Support%20TARINEO`}
            className="btn-orange inline-flex h-9 items-center px-4 text-[13.5px] font-medium"
          >
            Contacter le support
          </a>
        }
      >
        Retrouvez les réponses courantes, ou écrivez-nous directement.
      </PageHead>

      <ul className="flex flex-col gap-3">
        {FAQ.map((item) => (
          <li key={item.q} className="rounded-card border border-line bg-surface px-5 py-4 shadow-soft">
            <p className="font-medium text-ink">{item.q}</p>
            <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">{item.a}</p>
          </li>
        ))}
      </ul>

      <p className="text-[13px] text-muted-foreground">
        Aussi disponible depuis{" "}
        <Link href="/compte" className="font-medium text-tarineo-orange hover:underline">
          votre compte
        </Link>
        .
      </p>
    </section>
  );
}

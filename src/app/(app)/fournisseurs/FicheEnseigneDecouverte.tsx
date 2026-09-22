import Link from "next/link";
import Image from "next/image";
import { ImportDocument } from "../documents/ImportDocument";
import { PageHeader } from "@/components/tarineo/PageHeader";

type Props = {
  nom: string;
  metiers?: string;
  logo: string | null;
  urlImport: string;
  siteWeb?: string;
};

export function FicheEnseigneDecouverte({ nom, metiers, logo, urlImport, siteWeb }: Props) {
  return (
    <div>
      <PageHeader
        backHref="/fournisseurs"
        title={
          <span className="flex items-center gap-3">
            {logo ? (
              <Image src={logo} alt="" width={48} height={48} className="rounded-xl object-cover" />
            ) : (
              <span className="flex size-12 items-center justify-center rounded-xl bg-secondary text-lg font-bold text-primary">
                {nom.charAt(0)}
              </span>
            )}
            <span className="flex flex-col gap-0.5">
              <span>{nom}</span>
              {metiers && <span className="text-sm font-normal text-muted-foreground">{metiers}</span>}
            </span>
          </span>
        }
      />

      <section className="rounded-[24px] border border-[#FFE4D6] bg-gradient-to-br from-[#FFF8F5] to-white p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
          Importez un devis ou une facture {nom}
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Tarineo n&apos;affiche pas de prix publics. On lit <strong className="font-medium text-foreground">votre</strong>{" "}
          document et on le compare à ce que vous avez déjà payé chez {nom} — ou chez vos autres fournisseurs.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <ImportDocument label={`Importer chez ${nom}`} />
          <Link
            href={urlImport}
            className="inline-flex h-11 items-center justify-center rounded-full border border-[#E6E9EB] bg-white px-5 text-sm font-medium text-foreground hover:bg-[#F8F8F8]"
          >
            Voir mes documents
          </Link>
        </div>
      </section>

      <section className="mt-5 rounded-[20px] border border-[#E6E9EB] bg-white p-5 sm:p-6">
        <h3 className="text-sm font-semibold text-foreground">Comment ça marche</h3>
        <ol className="mt-4 space-y-4">
          <li className="flex gap-3 text-sm">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#FFF0E8] text-xs font-bold text-primary">
              1
            </span>
            <span className="text-muted-foreground">
              <strong className="font-medium text-foreground">Envoyez le PDF ou une photo</strong> du devis reçu en
              agence ou par mail.
            </span>
          </li>
          <li className="flex gap-3 text-sm">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#FFF0E8] text-xs font-bold text-primary">
              2
            </span>
            <span className="text-muted-foreground">
              <strong className="font-medium text-foreground">Tarineo extrait les prix</strong> ligne par ligne — vous
              vérifiez en 30 secondes si besoin.
            </span>
          </li>
          <li className="flex gap-3 text-sm">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#FFF0E8] text-xs font-bold text-primary">
              3
            </span>
            <span className="text-muted-foreground">
              <strong className="font-medium text-foreground">Dès le 2ᵉ document</strong>, une hausse de plus de 3 %
              par rapport à vos achats précédents déclenche une alerte.
            </span>
          </li>
        </ol>
        <p className="mt-5 text-xs text-muted-foreground">
          Vos prix restent privés — jamais partagés, jamais comparés à un catalogue marché.
        </p>
      </section>

      {siteWeb?.startsWith("http") && (
        <p className="mt-4 text-center text-sm text-muted-foreground">
          <a href={siteWeb} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
            Site {nom} →
          </a>
        </p>
      )}
    </div>
  );
}

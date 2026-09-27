import Link from "next/link";

export default function ProjetNotFound() {
  return (
    <section className="mx-auto max-w-[520px] py-16 text-center">
      <p className="mono-label">Projet</p>
      <h1 className="mt-3 font-display text-[32px] font-semibold tracking-tightest">
        Projet introuvable
      </h1>
      <p className="mt-2 text-[15px] text-muted-foreground">
        Ce slug n’existe pas sur ce compte, ou la fiche n’est plus là.
      </p>
      <Link
        href="/chantiers"
        className="btn-dark mt-6 inline-flex min-h-11 items-center rounded-pill px-5 text-[14px] font-medium"
      >
        Retour aux projets
      </Link>
    </section>
  );
}

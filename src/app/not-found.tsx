import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-primary">404</p>
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Page introuvable</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Cette adresse n&apos;existe pas ou n&apos;est plus disponible.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/accueil"
          className="inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground"
        >
          Retour à l&apos;accueil
        </Link>
        <a href="mailto:contact@tarineo.com" className="text-sm font-medium text-primary hover:underline">
          Contacter le support
        </a>
      </div>
    </main>
  );
}

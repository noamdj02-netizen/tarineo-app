import Link from "next/link";

export default function AppNotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-5 py-16 text-center">
      <h1 className="text-xl font-bold text-foreground">Page introuvable</h1>
      <p className="text-sm text-muted-foreground">Cette section n&apos;existe pas dans votre espace Tarinéo.</p>
      <Link href="/accueil" className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground">
        Retour à l&apos;accueil
      </Link>
      <a href="mailto:contact@tarineo.com" className="text-sm text-primary hover:underline">
        Contacter le support
      </a>
    </div>
  );
}

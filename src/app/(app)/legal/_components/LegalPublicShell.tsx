import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";

export function LegalPublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-[var(--background)]">
      <header className="border-b border-border bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-2">
            <BrandLogo className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/connexion" className="text-muted-foreground hover:text-foreground">
              Connexion
            </Link>
            <Link href="/inscription" className="app-btn-primary px-4 py-2 text-sm">
              Créer un compte
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}

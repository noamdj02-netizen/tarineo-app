import { FooterBrandWordmark } from "@/components/site/footer-brand-wordmark";
import { Logo } from "@/components/site/landing-v2/components/layout/Logo";
import { footerColumns } from "@/lib/site/landing-v2-content";

export function Footer() {
  return (
    <footer className="border-t border-line bg-paper-0">
      <div className="shell py-14 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)]">
          <div>
            <Logo />
            <p className="mt-5 max-w-xs text-sm text-ink-600">
              Tarinéo lit vos documents, comprend votre activité et fait avancer vos dossiers.
            </p>
            <a
              href="mailto:contact@tarineo.com"
              className="mt-5 inline-block text-sm font-medium text-accent-700 hover:text-accent-active"
            >
              contact@tarineo.com
            </a>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {footerColumns.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <h3 className="eyebrow">{column.title}</h3>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-ink-600 transition-colors duration-200 hover:text-ink-900"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 text-xs text-ink-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Tarinéo. Tous droits réservés.</p>
          <p>Conçu et hébergé en France.</p>
        </div>

        <div className="mt-6 border-t border-line sm:mt-8" aria-hidden />
        <FooterBrandWordmark tone="on-light" className="mt-6 sm:mt-8" />
      </div>
    </footer>
  );
}
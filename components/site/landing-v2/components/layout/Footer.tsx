import { FooterBrandWordmark } from "@/components/site/footer-brand-wordmark";
import { Logo } from "@/components/site/landing-v2/components/layout/Logo";
import { LandingSurface } from "@/components/site/landing-v2/components/ui/LandingSurface";
import { footerColumns } from "@/lib/site/landing-v2-content";

export function Footer() {
  return (
    <footer className="pb-10 sm:pb-14">
      <div className="shell">
        <LandingSurface
          glow={false}
          className="px-6 py-12 sm:px-10 sm:py-14"
          contentClassName="flex flex-col gap-10"
        >
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)]">
            <div>
              <Logo />
              <p className="mt-5 max-w-xs text-sm font-medium leading-relaxed text-ink-500">
                Tarineo lit vos documents, compare vos achats et prépare vos documents client.
              </p>
              <a
                href="mailto:contact@tarineo.com"
                className="mt-5 inline-block text-sm font-medium text-[#f7562c] hover:text-[#e04a22]"
              >
                contact@tarineo.com
              </a>
            </div>

            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              {footerColumns.map((column) => (
                <nav key={column.title} aria-label={column.title}>
                  <h3 className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-400">
                    {column.title}
                  </h3>
                  <ul className="mt-4 flex flex-col gap-2.5">
                    {column.links.map((link) => (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          className="text-sm font-medium text-ink-600 transition-colors duration-200 hover:text-ink-900"
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

          <div className="flex flex-col gap-3 border-t border-black/[0.06] pt-6 text-xs text-ink-400 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Tarineo. Tous droits réservés.</p>
            <p>Conçu en France, données hébergées en Europe.</p>
          </div>

          <FooterBrandWordmark tone="on-light" className="mt-2" />
        </LandingSurface>
      </div>
    </footer>
  );
}

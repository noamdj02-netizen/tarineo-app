import Link from "next/link";
import { BRAND } from "@/lib/brand";

const COLS = [
  {
    title: "Produit",
    links: [
      { href: "/#fonctions", label: "Fonctions" },
      { href: "/prix", label: "Prix" },
      { href: "/#faq", label: "FAQ" },
    ],
  },
  {
    title: "Compte",
    links: [
      { href: "/inscription", label: "Créer un compte" },
      { href: "/login", label: "Connexion" },
      { href: "/mot-de-passe-oublie", label: "Mot de passe oublié" },
    ],
  },
  {
    title: "Légal",
    links: [
      { href: "/mentions-legales", label: "Mentions légales" },
      { href: "/cgv", label: "CGV" },
      { href: "/confidentialite", label: "Confidentialité" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line px-5 pt-14 pb-10 sm:px-8">
      <div className="mx-auto grid max-w-[1120px] gap-10 sm:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="flex flex-col gap-3">
          <Link href="/" className="font-grotesk text-[22px] font-bold tracking-[-0.04em]">
            {BRAND.name}
            <span className="text-accent-2">.</span>
          </Link>
          <p className="max-w-[34ch] text-[14px] leading-relaxed text-muted">
            Le cockpit des fondateurs solo : tous tes projets au même endroit, un seul en Focus.
          </p>
        </div>
        {COLS.map((c) => (
          <div key={c.title}>
            <p className="mono-label mb-3">{`/ ${c.title} ///`}</p>
            <ul className="flex flex-col gap-2">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[14px] text-ink/70 hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mx-auto mt-12 max-w-[1120px] font-mono text-[11px] tracking-[0.08em] text-muted uppercase">
        © {new Date().getFullYear()} {BRAND.name} · Fait en France
      </p>
    </footer>
  );
}

import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { footerColumns } from "@/lib/site/landing-v2-content";

const FOOTER_ASSETS = {
  photo: "/landing/figma/footer/hero-photo.png",
  instagram: "/landing/figma/footer/instagram.svg",
  tiktok: "/landing/figma/footer/tiktok.svg",
} as const;

const SOCIAL = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/tarineo",
    src: FOOTER_ASSETS.instagram,
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@tarineo",
    src: FOOTER_ASSETS.tiktok,
  },
] as const;

/** Footer photo chantier — Figma 235:34993 */
export function PhotoFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-6 overflow-hidden">
      <div className="relative min-h-[520px] sm:min-h-[640px]">
        <div className="absolute inset-0 overflow-hidden" aria-hidden>
          <Image
            src={FOOTER_ASSETS.photo}
            alt=""
            fill
            className="object-cover object-[center_35%] scale-[1.15] sm:object-[18%_35%] sm:scale-[1.05]"
            sizes="100vw"
            priority={false}
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-[rgba(52,47,44,0.88)] from-[38%] via-[rgba(229,229,229,0.66)] via-[42%] to-[rgba(153,153,153,0)] to-[52%]"
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/40" aria-hidden />
        </div>

        <div className="relative z-10 mx-auto flex max-w-[1200px] flex-col gap-10 px-5 pb-28 pt-14 sm:px-10 sm:pb-36 sm:pt-[69px]">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
            <div className="flex max-w-[570px] flex-col gap-[27px]">
              <p className="text-[40px] font-normal leading-none tracking-tight text-white">{BRAND.name}</p>
              <div className="text-lg leading-7 text-white">
                <p className="mb-0">
                  Tarineo lit vos documents, compare vos achats et prépare vos documents client.
                </p>
                <a
                  href={`mailto:${BRAND.contactEmail}`}
                  className="mt-0 inline-block underline decoration-from-font underline-offset-2 transition-colors hover:text-white/90"
                >
                  {BRAND.contactEmail}
                </a>
              </div>
              <div className="flex items-center gap-3">
                {SOCIAL.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-[2px] transition-colors hover:border-white/40 hover:bg-white/20"
                    aria-label={item.label}
                  >
                    <Image
                      src={item.src}
                      alt=""
                      width={22}
                      height={22}
                      className="size-[22px]"
                    />
                  </a>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-10 sm:gap-16">
              {footerColumns.map((column) => (
                <nav key={column.title} aria-label={column.title} className="min-w-[7rem]">
                  <h3 className="text-base font-semibold text-[#ff6b1a]">{column.title}</h3>
                  <ul className="mt-3 flex flex-col gap-3">
                    {column.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="text-sm font-normal text-white transition-colors hover:text-white/85"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 text-sm font-normal text-white sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {year} Tarineo. Conçu en France, données hébergées en Europe.
            </p>
            <a
              href={BRAND.siteUrl}
              className="shrink-0 transition-colors hover:text-white/85"
            >
              Site officiel · tarineo.com
            </a>
          </div>
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] flex justify-center overflow-hidden px-4"
        >
          <p
            className="w-max max-w-full select-none text-center text-[clamp(6.5rem,22vw,19.375rem)] font-semibold italic leading-[0.88] tracking-[-0.02em] text-white/60 translate-y-[18%] sm:translate-y-[14%]"
          >
            {BRAND.name}
          </p>
        </div>
      </div>
    </footer>
  );
}

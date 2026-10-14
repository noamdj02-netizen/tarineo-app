"use client";

import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

import { ArtisanLaunchContactForm } from "@/components/site/landing-v2/components/ArtisanLaunchContactForm";
import { LandingSection } from "@/components/site/landing-v2/components/layout/LandingSection";
import { LandingFigmaSectionHeader } from "@/components/site/landing-v2/components/ui/LandingFigmaSectionHeader";
import { sectionContact } from "@/lib/site/landing-v2-content";
import { cn } from "@/lib/utils";

const LINE_ICONS = {
  phone: Phone,
  email: Mail,
  location: MapPin,
} as const;

/** Contact lancement — Figma 235:34915 / panneau 235:34923 */
export function LandingContact() {
  return (
    <LandingSection id="contact-section" bleed className="pb-16 sm:pb-24">
      <div className="shell">
        <div className="mx-auto flex max-w-[1120px] flex-col gap-10">
          <LandingFigmaSectionHeader
            align="center"
            badge={sectionContact.badge}
            title={sectionContact.title}
            subtitle={sectionContact.subtitle}
          />

          <div className="flex flex-col items-stretch gap-8 lg:flex-row lg:items-stretch lg:gap-8">
            <div
              className="relative mx-auto min-h-[520px] w-full max-w-[466px] shrink-0 overflow-hidden rounded-[27px] sm:min-h-[647px] lg:mx-0"
            >
              <Image
                src={sectionContact.panelPhoto}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 466px"
              />
              <Image
                src={sectionContact.panelOverlay}
                alt=""
                fill
                className="object-cover object-left"
                sizes="466px"
                aria-hidden
              />

              <div className="relative z-[1] flex h-full min-h-[520px] flex-col p-6 sm:min-h-[647px] sm:p-[23px]">
                <h3 className="max-w-[420px] text-[28px] font-bold leading-[1.2] text-white">
                  {sectionContact.panelTitle}
                </h3>
                <p className="mt-4 max-w-[420px] text-base leading-normal text-white/95">
                  {sectionContact.panelText}
                </p>

                <ul className="mt-8 flex flex-col gap-4 sm:mt-10">
                  {sectionContact.lines.map((line) => {
                    const Icon = LINE_ICONS[line.icon];
                    const content = (
                      <span className="flex items-center gap-3 text-base font-normal text-[#f8faff]">
                        <span
                          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/15"
                          aria-hidden
                        >
                          <Icon className="size-4 text-white" strokeWidth={2} />
                        </span>
                        <span className="leading-snug">{line.label}</span>
                      </span>
                    );
                    return (
                      <li key={line.label}>
                        {"href" in line && line.href ? (
                          <a href={line.href} className="transition-opacity hover:opacity-90">
                            {content}
                          </a>
                        ) : (
                          content
                        )}
                      </li>
                    );
                  })}
                </ul>

                <Link
                  href="#contact"
                  className="mt-8 inline-flex w-fit items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#111827] shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-opacity hover:opacity-95 sm:mt-10"
                >
                  Envoyer ma demande
                </Link>

                <div className="pointer-events-none relative mt-auto flex justify-end pt-4">
                  <Image
                    src="/landing/v2/mascots/mascot-equipe.webp"
                    alt=""
                    width={238}
                    height={198}
                    className="h-auto w-[min(220px,58%)] object-contain object-bottom drop-shadow-[0_8px_24px_rgba(0,0,0,0.2)]"
                  />
                </div>
              </div>
            </div>

            <div
              id="contact"
              className={cn(
                "flex w-full flex-1 flex-col rounded-[20px] bg-[#f4f2f2] px-5 py-8 sm:px-10 sm:py-10",
                "scroll-mt-24 lg:min-h-[595px] lg:justify-center",
              )}
            >
              <ArtisanLaunchContactForm embedded variant="figma" />
            </div>
          </div>
        </div>
      </div>
    </LandingSection>
  );
}

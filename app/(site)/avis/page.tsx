import Link from "next/link";
import { Reveal, RevealGroup } from "@/components/motion/reveal";
import { LandingButton } from "@/components/site/landing-button";
import { JsonLd } from "@/components/site/json-ld";
import TestimonialsMarquee from "@/components/ui/testimonials-with-marquee";
import { PRO_TRIAL_DAYS } from "@/lib/billing/plans";
import { siteMetadata } from "@/lib/seo";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { LANDING_TESTIMONIALS } from "@/lib/site/content";

const AVIS_TITLE = "Avis fondateurs";
const AVIS_DESCRIPTION =
  "Ce que des fondateurs solo disent de Navpit : un projet en Focus, la prochaine action, plus le chaos d’onglets.";

export const metadata = {
  title: AVIS_TITLE,
  description: AVIS_DESCRIPTION,
  ...siteMetadata({
    title: "Avis Navpit",
    description: AVIS_DESCRIPTION,
    path: "/avis",
  }),
};

export default function AvisPage() {
  return (
    <div className="pb-16 sm:pb-20">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Avis", path: "/avis" },
        ])}
      />
      <RevealGroup className="mx-auto flex max-w-[720px] flex-col items-center gap-3 px-4 pt-12 text-center sm:px-8 sm:pt-20">
        <Reveal>
          <p className="mono-label">/ Avis ///</p>
        </Reveal>
        <Reveal>
          <h1 className="font-display text-[clamp(34px,6vw,56px)] leading-[1.02] font-semibold tracking-tightest text-balance">
            Fondateurs solo,{" "}
            <span className="text-accent-2">ils avancent avec Navpit.</span>
          </h1>
        </Reveal>
        <Reveal>
          <p className="text-[16.5px] leading-relaxed text-muted-foreground">
            {AVIS_DESCRIPTION} {LANDING_TESTIMONIALS.length} retours. Pas de chiffres inventés.
          </p>
        </Reveal>
      </RevealGroup>

      <div className="mt-10">
        <TestimonialsMarquee hideIntro />
      </div>

      <div className="mx-auto mt-6 flex max-w-[480px] flex-col items-center gap-3 px-4 text-center">
        <p className="text-[15px] text-muted-foreground">
          Essai Pro {PRO_TRIAL_DAYS} jours, sans carte.
        </p>
        <LandingButton href="/inscription?plan=pro">Commencer l’essai</LandingButton>
        <Link href="/#faq" className="text-[14px] text-muted-foreground underline underline-offset-2">
          Questions fréquentes
        </Link>
      </div>
    </div>
  );
}

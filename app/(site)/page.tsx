import { JsonLd } from "@/components/site/json-ld";
import { LandingV2Page } from "@/components/site/landing-v2/landing-v2-page";
import { BRAND } from "@/lib/brand";
import { siteMetadata } from "@/lib/seo";
import { faqPageJsonLd, softwareApplicationJsonLd } from "@/lib/seo/json-ld";

const HOME_TITLE = `${BRAND.name} — L'administratif des artisans, en pilote automatique`;
const HOME_DESCRIPTION =
  "Tarinéo lit vos emails et vos documents, comprend votre activité et automatise vos devis, relances et factures. Vous gardez le contrôle à chaque étape.";

export const metadata = {
  ...siteMetadata({ title: HOME_TITLE, description: HOME_DESCRIPTION, path: "/" }),
  title: { absolute: HOME_TITLE },
  description: HOME_DESCRIPTION,
};

export default function LandingPage() {
  return (
    <>
      <JsonLd data={[softwareApplicationJsonLd(), faqPageJsonLd()]} />
      <LandingV2Page />
    </>
  );
}

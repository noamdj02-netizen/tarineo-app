import { JsonLd } from "@/components/site/json-ld";
import { LandingV2Page } from "@/components/site/landing-v2/landing-v2-page";
import { BRAND } from "@/lib/brand";
import { siteMetadata } from "@/lib/seo";
import { faqPageJsonLd, softwareApplicationJsonLd } from "@/lib/seo/json-ld";

const HOME_TITLE = `${BRAND.name} — L'assistant qui protège votre marge`;
const HOME_DESCRIPTION =
  "Logiciel pour artisans du bâtiment : comparez vos achats fournisseurs, repérez les hausses de prix, suivez vos chantiers et générez devis et factures clients. Vous validez chaque envoi.";

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

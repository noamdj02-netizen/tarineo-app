import { Link, Text } from "@react-email/components";
import { BRAND } from "@/lib/brand";
import { EmailCta, EmailParagraph, TarineoEmailShell } from "./shell";

export type CheckInEmailProps = {
  firstName?: string;
  appUrl: string;
  /** Adresse de réponse (Noam). */
  replyTo?: string;
};

/** Objet recommandé (parmi CHECK_IN_SUBJECTS). */
export const CHECK_IN_SUBJECT = "Tout se passe bien de ton côté ?";

/** 5 objets courts, naturels, sans clickbait. */
export const CHECK_IN_SUBJECTS = [
  "Tout se passe bien de ton côté ?",
  "Une minute pour TARINEO ?",
  "Tu t’en sors avec TARINEO ?",
  "Petit check de Noam",
  "Il y a un truc qui te bloque ?",
] as const;

export const CHECK_IN_IMPROVEMENTS = [
  "rendre le chantier ouvert encore plus net",
  "clarifier la prochaine pièce à envoyer, sans réfléchir",
  "améliorer l’assistant avec vos vrais devis et achats",
  "simplifier le passage devis → commande → facture",
  "rendre l’ensemble plus simple et plus rapide au quotidien",
] as const;

export const CHECK_IN_CTA_VARIANTS = [
  "Répondre à Noam",
  "Lui écrire deux phrases",
  "Répondre à ce mail",
] as const;

/**
 * Mail perso J+quelques jours après inscription.
 * Objectif unique : que l’utilisateur réponde. Pas de vente.
 */
export function CheckInEmail({
  firstName,
  appUrl,
  replyTo = BRAND.contactEmail,
}: CheckInEmailProps) {
  const base = appUrl.replace(/\/$/, "");
  const hello = firstName?.trim() ? `Salut ${firstName.trim()},` : "Salut,";
  const mailto = `mailto:${replyTo}?subject=${encodeURIComponent("Retour sur TARINEO")}`;

  return (
    <TarineoEmailShell
      preview="Juste un check rapide — tu peux me répondre en deux phrases."
      label="Check-in"
      title="Comment ça se passe ?"
      appUrl={base}
      footerNote="Pas de pub, pas d’offre. Juste Noam qui lit les réponses pour décider quoi construire ensuite."
    >
      <EmailParagraph>{hello}</EmailParagraph>
      <EmailParagraph>
        Tu fais partie des nouveaux sur TARINEO. Je t’écris juste pour savoir comment se passe ton expérience —
        pas pour te vendre quoi que ce soit.
      </EmailParagraph>
      <EmailParagraph>
        Est-ce que tu as compris vite comment ça marche ? Tu as réussi à poser ton premier devis ? Il y a un
        truc qui t’a bloqué, une fonctionnalité qui te manque, ou un coin de l’app que tu ne piges pas ?
        Si tu veux, je peux aussi te montrer une partie précise.
      </EmailParagraph>
      <EmailParagraph>
        Tu peux simplement me répondre à ce mail, même avec deux phrases. Je lis les réponses.
      </EmailParagraph>

      <Text className="m-0 mb-2 mt-6 font-display text-20 font-semibold tracking-[-0.03em] text-ink">
        Ce qu&apos;on améliore en ce moment 👇
      </Text>
      <Text className="m-0 mb-4 font-sans text-15 leading-relaxed text-ink-2">On travaille notamment sur :</Text>
      {CHECK_IN_IMPROVEMENTS.map((item) => (
        <Text key={item} className="m-0 mb-1.5 font-sans text-15 leading-relaxed text-ink-2">
          · {item}
        </Text>
      ))}

      <EmailParagraph>
        Si tu as une remarque, même toute petite, réponds-moi. C’est exactement ce genre de retour qui nous aide
        à décider quoi construire ensuite.
      </EmailParagraph>

      <EmailCta href={mailto}>{CHECK_IN_CTA_VARIANTS[0]}</EmailCta>

      <Text className="m-0 mt-8 font-sans text-15 leading-relaxed text-ink">
        Noam
        <br />
        <Link href={base} className="text-ink-2 no-underline">
          TARINEO
        </Link>
      </Text>
    </TarineoEmailShell>
  );
}

/** Version plus courte — même intention, moins de lignes. */
export function CheckInEmailShort({
  firstName,
  appUrl,
  replyTo = BRAND.contactEmail,
}: CheckInEmailProps) {
  const base = appUrl.replace(/\/$/, "");
  const hello = firstName?.trim() ? `Salut ${firstName.trim()},` : "Salut,";
  const mailto = `mailto:${replyTo}?subject=${encodeURIComponent("Retour sur TARINEO")}`;

  return (
    <TarineoEmailShell
      preview="Deux phrases suffisent — je lis."
      label="Check-in"
      title="Un petit check"
      appUrl={base}
      footerNote="Réponds quand tu peux. Pas d’urgence, pas de pitch."
    >
      <EmailParagraph>{hello}</EmailParagraph>
      <EmailParagraph>
        Tu es parmi les nouveaux sur TARINEO. Est-ce que tu t’en sors ? Un truc qui bloque, qui manque, ou que
        tu ne comprends pas ?
      </EmailParagraph>
      <EmailParagraph>Réponds à ce mail, même en deux phrases. Je lis.</EmailParagraph>
      <EmailParagraph>
        On prépare en ce moment un chantier plus clair, des pièces client plus nettes, et un assistant plus
        utile. Ton retour oriente la suite.
      </EmailParagraph>
      <EmailCta href={mailto}>Répondre à Noam</EmailCta>
      <Text className="m-0 mt-8 font-sans text-15 leading-relaxed text-ink">
        Noam
        <br />
        TARINEO
      </Text>
    </TarineoEmailShell>
  );
}

CheckInEmail.PreviewProps = {
  firstName: "Camille",
  appUrl: "https://app.tarineo.com",
} satisfies CheckInEmailProps;

CheckInEmailShort.PreviewProps = {
  firstName: "Camille",
  appUrl: "https://app.tarineo.com",
} satisfies CheckInEmailProps;

export default CheckInEmail;

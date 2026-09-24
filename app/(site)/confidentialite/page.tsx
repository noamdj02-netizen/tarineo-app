import { LegalPage } from "@/components/site/legal-page";

export const metadata = { title: "Confidentialité" };

export default function ConfidentialitePage() {
  return (
    <LegalPage
      title="Politique de confidentialité"
      updated="24 septembre 2026"
      sections={[
        {
          h: "Données collectées",
          p: [
            "Compte : email, prénom, mot de passe (chiffré, jamais lisible). Contenu : tes projets, tâches, notes, schémas, ressources, événements et questions au copilote. Paiement : géré par Stripe, Navpit ne voit jamais ton numéro de carte.",
            "Agenda : si tu connectes un lien iCal, il est lu en lecture seule par le serveur pour afficher tes événements. Ils ne sont pas copiés en base.",
          ],
        },
        {
          h: "Pourquoi",
          p: [
            "Uniquement pour faire fonctionner le service, facturer les offres payantes et t’envoyer les emails liés à ton compte. Pas de revente, pas de publicité.",
          ],
        },
        {
          h: "Sous-traitants",
          p: [
            "Supabase (base de données et connexion), Vercel (hébergement), Stripe (paiement), Resend (emails), Anthropic (réponses du copilote IA : tes questions et le contexte de tes projets lui sont envoyés pour générer la réponse).",
          ],
        },
        {
          h: "Durée et sécurité",
          p: [
            "Tes données sont gardées tant que ton compte existe. Chaque compte ne voit que ses propres données, grâce à une protection au niveau de la base (Row Level Security).",
          ],
        },
        {
          h: "Tes droits",
          p: [
            "Tu peux demander l’accès, la correction, l’export ou la suppression de tes données en écrivant à [À compléter : email]. Tu peux aussi saisir la CNIL (cnil.fr).",
          ],
        },
      ]}
    />
  );
}

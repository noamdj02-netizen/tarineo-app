import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-ui";
import { ForgotForm } from "./forgot-form";

export const metadata = { title: "Mot de passe oublié" };

export default function ForgotPage() {
  return (
    <AuthCard
      art="feedback-question"
      label="Mot de passe"
      title="Mot de passe oublié ?"
      text="Donne ton email, on t’envoie un lien pour en choisir un nouveau."
      footer={
        <Link href="/login" className="font-medium text-ink underline-offset-4 hover:underline">
          Retour à la connexion
        </Link>
      }
    >
      <ForgotForm />
    </AuthCard>
  );
}

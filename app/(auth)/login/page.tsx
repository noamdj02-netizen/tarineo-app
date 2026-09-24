import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-ui";
import { LoginForm } from "./login-form";

export const metadata = { title: "Connexion" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  return (
    <AuthCard
      art="onboarding-bienvenue"
      label="Connexion"
      title="Bon retour."
      text="Connecte-toi pour retrouver tes projets."
      footer={
        <>
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="font-medium text-ink underline-offset-4 hover:underline">
            Créer un compte
          </Link>
        </>
      }
    >
      <LoginForm next={next} linkError={error === "lien"} />
    </AuthCard>
  );
}

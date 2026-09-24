import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-ui";
import { LoginForm } from "./login-form";

export const metadata = { title: "Connexion" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; signed_out?: string }>;
}) {
  const { next, error, signed_out } = await searchParams;
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
      <LoginForm
        next={next}
        linkError={error === "lien"}
        signedOut={signed_out === "1"}
      />
    </AuthCard>
  );
}

import { AuthCard } from "@/components/auth/auth-ui";
import { ResetForm } from "./reset-form";

export const metadata = { title: "Nouveau mot de passe" };

export default function ResetPage() {
  return (
    <AuthCard
      mascot="07-ordinateur"
      label="Mot de passe"
      title="Choisis un nouveau mot de passe."
    >
      <ResetForm />
    </AuthCard>
  );
}

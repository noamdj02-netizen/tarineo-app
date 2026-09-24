import { Illustration } from "@/components/illustration";
import { BRAND } from "@/lib/brand";
import { LoginForm } from "./login-form";

export const metadata = { title: "Connexion" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  return (
    <div className="wrap">
      <div className="mx-auto flex max-w-md flex-col gap-4 pt-[8vh]">
        <header className="top">
          <div>
            <div className="eyebrow">{BRAND.tagline}</div>
            <h1>{BRAND.name}</h1>
            <p>Connecte-toi avec ton email. Pas de mot de passe.</p>
          </div>
          <Illustration name="onboarding-bienvenue" className="-my-2 size-20 sm:size-24" />
        </header>
        <div className="dbox">
          <LoginForm next={next} linkError={error === "lien"} />
        </div>
      </div>
    </div>
  );
}

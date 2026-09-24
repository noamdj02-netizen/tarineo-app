import Link from "next/link";
import { Illustration } from "@/components/illustration";

export const metadata = { title: "Page introuvable" };

export default function NotFound() {
  return (
    <main className="grid min-h-[70dvh] place-items-center px-6 py-16 text-center">
      <div className="flex max-w-[40ch] flex-col items-center gap-3">
        <Illustration name="feedback-erreur" className="size-28" />
        <p className="mono-label">{"/ 404 ///"}</p>
        <h1 className="font-display text-[clamp(26px,5vw,34px)] leading-[1.05] font-semibold tracking-tightest">
          Page introuvable.
        </h1>
        <p className="text-[15px] text-muted">Le lien est faux ou la page a été déplacée.</p>
        <Link
          href="/accueil"
          className="btn-dark mt-2 inline-flex min-h-11 items-center rounded-pill px-5 text-[14px] font-semibold"
        >
          Retour à l’accueil
        </Link>
      </div>
    </main>
  );
}

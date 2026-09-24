"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { openOnboardingWizard } from "./actions";

export function OnboardingLaunch({ needsContinue }: { needsContinue: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  if (needsContinue) {
    return (
      <Link
        href="/onboarding"
        className="btn-dark inline-flex min-h-11 items-center rounded-pill px-5 text-[14px] font-medium"
      >
        Continuer la configuration
      </Link>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await openOnboardingWizard();
          if (!res.ok) return;
          router.push("/onboarding");
          router.refresh();
        })
      }
      className="btn-dark inline-flex min-h-11 items-center rounded-pill px-5 text-[14px] font-medium disabled:opacity-60"
    >
      {pending ? "Ouverture…" : "Lancer le parcours guidé"}
    </button>
  );
}

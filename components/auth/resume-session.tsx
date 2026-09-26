"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { continueAfterAuth } from "@/lib/auth/continue-after-auth";
import { kindFromEmailType } from "@/lib/auth/verified";
import { createClient } from "@/lib/supabase/client";

/** Ancien lien Supabase : la session est dans le fragment, invisible pour le serveur. */
export function ResumeSession({ next }: { next: string }) {
  const router = useRouter();

  useEffect(() => {
    let cancel = false;
    (async () => {
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const access = hash.get("access_token");
      const refresh = hash.get("refresh_token");
      const kind = kindFromEmailType(hash.get("type"));
      if (access && refresh) {
        const { error } = await createClient().auth.setSession({
          access_token: access,
          refresh_token: refresh,
        });
        if (error) {
          if (!cancel) router.replace("/login?error=lien");
          return;
        }
      }
      const settled = await continueAfterAuth(next, kind);
      if (cancel) return;
      if (!settled.ok) {
        router.replace("/login?error=lien");
        return;
      }
      router.replace(settled.path);
      router.refresh();
    })();
    return () => {
      cancel = true;
    };
  }, [next, router]);

  return (
    <p className="flex min-h-dvh items-center justify-center text-[15px] text-muted-foreground">Connexion…</p>
  );
}

"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  KeyRound,
  Mail,
  Calendar,
  Building2,
  Package,
  Plug,
  Loader2,
  CreditCard,
} from "lucide-react";
import { googleOAuthHref } from "@/lib/integrations/hub";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  completeGoogleBindAction,
  disconnectIntegrationAction,
  joinIntegrationWaitlistAction,
  testIntegrationConnectionAction,
} from "@/app/(app)/parametres/integrations-notifications-actions";
import { integrationSupportsConnectionTest } from "@/lib/integrations/client";
import { CATEGORY_LABEL, type IntegrationSnapshot } from "@/lib/settings/integrations-catalog";
import { cn } from "@/lib/utils";

const ICONS: Record<string, typeof Mail> = {
  tarineo_email: Mail,
  stripe_billing: CreditCard,
  google: Mail,
  microsoft: Mail,
  calendar_ical: Calendar,
  pennylane: Building2,
  sellsy: Building2,
  sage: Building2,
  ebp: Building2,
  quickbooks: Building2,
  cedeo: Package,
  pointp: Package,
  rexel: Package,
  sonepar: Package,
  api_tarineo: KeyRound,
};

function statusLabel(s: IntegrationSnapshot["status"]) {
  switch (s) {
    case "connected":
      return "Connecté";
    case "available":
      return "Disponible";
    case "requires_setup":
      return "Configuration requise";
    case "coming_soon":
      return "Disponible prochainement";
    case "error":
      return "Erreur";
    case "reconnection_required":
      return "Reconnexion requise";
    case "disabled":
      return "Désactivé";
  }
}

function statusDot(s: IntegrationSnapshot["status"]) {
  switch (s) {
    case "connected":
      return "bg-st-focus-ink";
    case "available":
      return "bg-tarineo-orange";
    case "reconnection_required":
      return "bg-amber-500";
    case "error":
      return "bg-destructive";
    default:
      return "bg-muted-foreground/50";
  }
}

function relativeTime(iso: string | null | undefined) {
  if (!iso) return null;
  const t = +new Date(iso);
  if (!Number.isFinite(t)) return null;
  const diff = Date.now() - t;
  const min = Math.round(diff / 60000);
  if (min < 1) return "À l’instant";
  if (min < 60) return `Il y a ${min} min`;
  const h = Math.round(min / 60);
  if (h < 48) return `Il y a ${h} h`;
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export function IntegrationsBoard({
  items,
  canEdit,
  bound,
  oauthError,
}: {
  items: IntegrationSnapshot[];
  canEdit: boolean;
  bound?: string | null;
  oauthError?: boolean;
}) {
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(oauthError ? "La connexion n’a pas pu être établie." : null);
  const [googleOpen, setGoogleOpen] = useState(false);
  const router = useRouter();
  const [pending, start] = useTransition();
  const [testMsg, setTestMsg] = useState<Record<string, string>>({});

  function runTest(id: string) {
    start(async () => {
      setErr(null);
      const res = await testIntegrationConnectionAction(id);
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      setTestMsg((m) => ({ ...m, [id]: res.result.message }));
      router.refresh();
    });
  }

  useEffect(() => {
    if (bound === "gmail" || bound === "drive") {
      start(async () => {
        const res = await completeGoogleBindAction(bound === "drive" ? "google-drive" : "gmail");
        if (!res.ok) {
          setErr(res.error);
          return;
        }
        const test = await testIntegrationConnectionAction("google");
        if (test.ok) {
          setTestMsg((m) => ({ ...m, google: test.result.message }));
          setMsg(
            test.result.outcome === "ok"
              ? "Google connecté et vérifié."
              : "Google lié — action requise (voir le statut).",
          );
        } else {
          setMsg("Google connecté.");
        }
        router.refresh();
      });
    }
  }, [bound, router]);

  const grouped = (
    ["billing", "messagerie", "comptabilite", "fournisseurs", "api"] as const
  ).map((cat) => ({
    cat,
    label: CATEGORY_LABEL[cat],
    list: items.filter((i) => i.category === cat),
  }));

  function disconnect(id: string) {
    start(async () => {
      setErr(null);
      const res = await disconnectIntegrationAction(id);
      if (!res.ok) setErr(res.error);
      else {
        setMsg("Intégration déconnectée.");
        router.refresh();
      }
    });
  }

  function waitlist(id: string) {
    start(async () => {
      setErr(null);
      const res = await joinIntegrationWaitlistAction(id);
      if (!res.ok) setErr(res.error);
      else setMsg(res.already ? "Vous êtes déjà sur la liste." : "Nous vous préviendrons.");
    });
  }

  return (
    <div className="flex flex-col gap-8">
      {msg ? (
        <p className="rounded-xl bg-st-focus-soft px-4 py-3 text-[13.5px] text-st-focus-ink" role="status">
          {msg}
        </p>
      ) : null}
      {err ? (
        <p className="rounded-xl bg-destructive/10 px-4 py-3 text-[13.5px] text-destructive" role="alert">
          {err}
        </p>
      ) : null}

      {grouped.map(({ cat, label, list }) => (
        <section key={cat} className="flex flex-col gap-3">
          <h3 className="px-0.5 text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
            {label}
          </h3>
          {cat === "fournisseurs" ? (
            <p className="text-[13px] text-muted-foreground">
              Automatisez la récupération et l’analyse de vos documents fournisseurs.{" "}
              <Link href="/distributeur/devis" className="font-medium text-brand-orange underline-offset-2 hover:underline">
                Import manuel disponible
              </Link>
              .
            </p>
          ) : null}
          <ul className="grid gap-3 sm:grid-cols-2">
            {list.map((item) => {
              const Icon = ICONS[item.id] ?? Plug;
              return (
                <li
                  key={item.id}
                  className={cn(
                    "card-soft flex flex-col gap-3 p-5 transition-colors duration-150 hover:border-line",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-surface-2 text-ink">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-medium text-ink">{item.name}</p>
                      <p className="text-[12.5px] text-muted-foreground">{item.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-[13px] leading-relaxed text-muted-foreground">{item.description}</p>
                  <div className="flex items-center gap-2 text-[12.5px]">
                    <span className={cn("size-1.5 rounded-full", statusDot(item.status))} aria-hidden />
                    <span className="font-medium text-ink">{statusLabel(item.status)}</span>
                  </div>
                  {item.healthMessage && item.status === "connected" ? (
                    <p className="rounded-xl bg-st-focus-soft/60 px-3 py-2 text-[12.5px] text-st-focus-ink" role="status">
                      {item.healthMessage}
                    </p>
                  ) : null}
                  {testMsg[item.id] ? (
                    <p className="rounded-xl bg-surface-2 px-3 py-2 text-[12.5px] text-ink" role="status">
                      {testMsg[item.id]}
                    </p>
                  ) : null}
                  {item.status === "connected" || item.status === "reconnection_required" ? (
                    <div className="rounded-xl bg-surface-2 px-3 py-2.5 text-[12.5px] text-muted-foreground">
                      {item.accountLabel ? (
                        <p>
                          Compte : <span className="text-ink">{item.accountLabel}</span>
                        </p>
                      ) : null}
                      {relativeTime(item.lastSyncAt) ? (
                        <p className="mt-0.5">Dernière synchronisation : {relativeTime(item.lastSyncAt)}</p>
                      ) : null}
                      {item.permissions?.length ? (
                        <p className="mt-0.5">Permissions : {item.permissions.join(" · ")}</p>
                      ) : null}
                    </div>
                  ) : null}
                  {item.errorMessage ? (
                    <p className="text-[12.5px] text-destructive">{item.errorMessage}</p>
                  ) : null}

                  <div className="mt-auto flex flex-wrap gap-2 pt-1">
                    {integrationSupportsConnectionTest(item.id) && canEdit ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        disabled={pending}
                        onClick={() => runTest(item.id)}
                      >
                        {pending ? (
                          <>
                            <Loader2 className="size-3.5 animate-spin" aria-hidden /> Test…
                          </>
                        ) : (
                          "Tester la connexion"
                        )}
                      </Button>
                    ) : null}
                    {item.id === "google" &&
                      item.status !== "connected" &&
                      item.status !== "reconnection_required" &&
                      canEdit ? (
                      <Button
                        type="button"
                        size="sm"
                        className="rounded-full"
                        onClick={() => setGoogleOpen(true)}
                        disabled={pending}
                      >
                        Connecter Google
                      </Button>
                    ) : null}
                    {item.id === "google" &&
                      (item.status === "connected" || item.status === "reconnection_required") &&
                      canEdit ? (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="rounded-full"
                          disabled={pending}
                          onClick={() => disconnect("google")}
                        >
                          Déconnecter
                        </Button>
                        <a
                          href={googleOAuthHref("gmail")}
                          className={cn(buttonVariants({ size: "sm", variant: "ghost" }), "rounded-full")}
                        >
                          {item.status === "reconnection_required" ? "Reconnecter" : "Réautoriser"}
                        </a>
                      </>
                    ) : null}
                    {item.id === "stripe_billing" ? (
                      <Link
                        href="/abonnement"
                        className={cn(buttonVariants({ size: "sm" }), "rounded-full")}
                      >
                        {item.status === "connected" ? "Gérer l’abonnement" : "Voir les offres"}
                      </Link>
                    ) : null}
                    {item.id === "calendar_ical" && item.status !== "connected" ? (
                      <Link
                        href="/accueil"
                        className={cn(buttonVariants({ size: "sm" }), "rounded-full")}
                      >
                        Configurer le flux iCal
                      </Link>
                    ) : null}
                    {item.id === "calendar_ical" && item.status === "connected" && canEdit ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        disabled={pending}
                        onClick={() => disconnect("calendar_ical")}
                      >
                        Déconnecter
                      </Button>
                    ) : null}
                    {item.id === "api_tarineo" ? (
                      <Link
                        href="/parametres/compte#agents"
                        className={cn(buttonVariants({ size: "sm" }), "rounded-full")}
                      >
                        {item.status === "connected" ? "Gérer les clés" : "Créer une clé API"}
                      </Link>
                    ) : null}
                    {item.capability === "manual_import" ? (
                      <Link
                        href="/distributeur/devis"
                        className={cn(buttonVariants({ size: "sm", variant: "outline" }), "rounded-full")}
                      >
                        Importer un devis
                      </Link>
                    ) : null}
                    {item.status === "coming_soon" && canEdit ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        disabled={pending || item.waitlisted}
                        onClick={() => waitlist(item.id)}
                      >
                        {item.waitlisted ? (
                          <>
                            <Check className="size-3.5" aria-hidden /> Inscrit
                          </>
                        ) : pending ? (
                          <>
                            <Loader2 className="size-3.5 animate-spin" aria-hidden /> …
                          </>
                        ) : (
                          "Être informé"
                        )}
                      </Button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <Dialog open={googleOpen} onOpenChange={setGoogleOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Connecter Google</DialogTitle>
            <DialogDescription>Vous allez autoriser TARINEO à :</DialogDescription>
          </DialogHeader>
          <ul className="flex flex-col gap-2 text-[14px] text-ink">
            <li className="flex gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-tarineo-orange" aria-hidden />
              Lire le profil nécessaire à l’identification du compte
            </li>
            <li className="flex gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-tarineo-orange" aria-hidden />
              Préparer l’envoi depuis Gmail (les relances automatiques passent encore par E-mails TARINEO)
            </li>
          </ul>
          <p className="text-[12.5px] text-muted-foreground">
            Aucune autre permission n’est demandée. L’agenda se configure via la carte « Agenda (iCal) ».
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" className="rounded-full" onClick={() => setGoogleOpen(false)}>
              Annuler
            </Button>
            <a
              href={googleOAuthHref("gmail")}
              className={cn(buttonVariants({ variant: "default" }), "rounded-full")}
            >
              Continuer avec Google
            </a>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

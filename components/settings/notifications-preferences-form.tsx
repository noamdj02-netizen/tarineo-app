"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { SettingsSwitch } from "@/components/settings/settings-switch";
import { Button } from "@/components/ui/button";
import { saveNotificationPreferencesAction } from "@/app/(app)/parametres/integrations-notifications-actions";
import {
  COPILOT_EVENTS,
  FOLLOWUP_EVENTS,
  PROJECT_EVENTS,
  QUOTE_EVENTS,
  SUPPLIER_EVENTS,
  type NotificationEventKey,
  type NotificationPreferences,
} from "@/lib/settings/notification-preferences";

type CatKey = "quotes" | "supplier" | "followups" | "copilot" | "projects";

const CATEGORIES: {
  key: CatKey;
  title: string;
  description: string;
  emailKey: keyof NotificationPreferences;
  inAppKey: keyof NotificationPreferences;
  pushKey: keyof NotificationPreferences;
  events: { key: NotificationEventKey; label: string }[];
}[] = [
  {
    key: "quotes",
    title: "Devis & factures",
    description: "Pièces générées, envoyées ou en retard.",
    emailKey: "emailQuotes",
    inAppKey: "inAppQuotes",
    pushKey: "pushQuotes",
    events: QUOTE_EVENTS,
  },
  {
    key: "supplier",
    title: "Hausses fournisseurs",
    description: "Soyez alerté lorsqu’un prix d’achat évolue.",
    emailKey: "emailSupplierIncreases",
    inAppKey: "inAppSupplierIncreases",
    pushKey: "pushSupplierIncreases",
    events: SUPPLIER_EVENTS,
  },
  {
    key: "followups",
    title: "Relances clients",
    description: "Relances programmées et échéances.",
    emailKey: "emailFollowups",
    inAppKey: "inAppFollowups",
    pushKey: "pushFollowups",
    events: FOLLOWUP_EVENTS,
  },
  {
    key: "copilot",
    title: "IA / Copilote",
    description: "Actions à confirmer et analyses.",
    emailKey: "emailCopilot",
    inAppKey: "inAppCopilot",
    pushKey: "pushCopilot",
    events: COPILOT_EVENTS,
  },
  {
    key: "projects",
    title: "Chantiers",
    description: "Activité et échéances sur vos chantiers.",
    emailKey: "emailProjects",
    inAppKey: "inAppProjects",
    pushKey: "pushProjects",
    events: PROJECT_EVENTS,
  },
];

export function NotificationsPreferencesForm({
  initial,
  email,
  canEdit,
  recentAlerts,
  pushConfigured,
}: {
  initial: NotificationPreferences;
  email: string;
  canEdit: boolean;
  recentAlerts: { id: string; title: string; detail: string; at: string; unread: boolean }[];
  pushConfigured: boolean;
}) {
  const [prefs, setPrefs] = useState(initial);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [pushBusy, setPushBusy] = useState(false);

  useEffect(() => setPrefs(initial), [initial]);

  function persist(
    patch: Parameters<typeof saveNotificationPreferencesAction>[0],
    optimistic: NotificationPreferences,
  ) {
    setPrefs(optimistic);
    setMsg(null);
    setErr(null);
    start(async () => {
      const res = await saveNotificationPreferencesAction(patch);
      if (!res.ok) {
        setErr(res.error);
        setPrefs(initial);
        return;
      }
      setMsg("Préférences enregistrées.");
    });
  }

  async function enablePush() {
    if (!pushConfigured || !canEdit) return;
    setPushBusy(true);
    setErr(null);
    try {
      const cfg = await fetch("/api/push/subscribe").then((r) => r.json());
      if (!cfg.configured || !cfg.publicKey) {
        setErr("Push non configuré sur ce serveur (clés VAPID manquantes).");
        return;
      }
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setErr("Permission refusée. Les notifications in-app restent actives.");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(cfg.publicKey),
      });
      const json = sub.toJSON();
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
      });
      const body = await res.json();
      if (!res.ok) {
        setErr(body.error ?? "Impossible d’activer le push.");
        return;
      }
      const next = { ...prefs, pushEnabled: true };
      setPrefs(next);
      setMsg("Notifications push activées.");
    } catch (e) {
      console.error(e);
      setErr("Activation push impossible sur cet appareil.");
    } finally {
      setPushBusy(false);
    }
  }

  async function disablePush() {
    setPushBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      persist({ pushEnabled: false }, { ...prefs, pushEnabled: false });
    } finally {
      setPushBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
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

      <section className="card-soft p-5 sm:p-6">
        <p className="mono-label mb-2">/ Push ///</p>
        <p className="text-[15px] font-medium text-ink">
          {prefs.pushEnabled ? "Activé" : "Désactivé"}
        </p>
        <p className="mt-1 text-[13px] text-muted-foreground">
          {pushConfigured
            ? "Recevez les alertes même lorsque TARINEO est fermé."
            : "Push navigateur non configuré sur ce serveur (VAPID). Les alertes in-app fonctionnent."}
        </p>
        {pushConfigured && canEdit ? (
          <Button
            type="button"
            size="sm"
            className="mt-3 rounded-full"
            disabled={pushBusy || pending}
            onClick={() => (prefs.pushEnabled ? void disablePush() : void enablePush())}
          >
            {prefs.pushEnabled ? "Désactiver le push" : "Activer le push"}
          </Button>
        ) : null}
      </section>

      <section className="card-soft p-5 sm:p-6">
        <p className="mono-label mb-2">/ Email ///</p>
        <p className="text-[15px] font-medium text-ink">{email || "Adresse non renseignée"}</p>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Modifiez l’adresse depuis{" "}
          <Link href="/parametres/compte" className="font-medium text-brand-orange underline-offset-2 hover:underline">
            Mon compte
          </Link>
          .
        </p>
      </section>

      {recentAlerts.length > 0 ? (
        <section className="card-soft p-5 sm:p-6">
          <p className="mono-label mb-3">/ Dans TARINEO ///</p>
          <ul className="divide-y divide-line">
            {recentAlerts.map((a) => (
              <li key={a.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                <span
                  className={`mt-1.5 size-2 shrink-0 rounded-full ${a.unread ? "bg-tarineo-orange" : "bg-muted-foreground/30"}`}
                  aria-hidden
                />
                <div className="min-w-0">
                  <p className="text-[14px] font-medium text-ink">{a.title}</p>
                  <p className="text-[13px] text-muted-foreground">{a.detail}</p>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">{a.at}</p>
                </div>
              </li>
            ))}
          </ul>
          <Link
            href="/notifications"
            className="mt-3 inline-block text-[13px] font-medium text-brand-orange underline-offset-2 hover:underline"
          >
            Centre de notifications
          </Link>
        </section>
      ) : null}

      <section className="flex flex-col gap-4">
        <h3 className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
          Canaux par type
        </h3>
        {CATEGORIES.map((cat) => (
          <div key={cat.key} className="card-soft overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-line px-5 py-4">
              <div>
                <p className="text-[15px] font-medium text-ink">{cat.title}</p>
                <p className="text-[13px] text-muted-foreground">{cat.description}</p>
              </div>
              <div className="flex flex-wrap items-center gap-5">
                <label className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
                  Push
                  <SettingsSwitch
                    checked={Boolean(prefs[cat.pushKey])}
                    disabled={!canEdit || pending}
                    label={`${cat.title} push`}
                    onCheckedChange={(v) =>
                      persist({ [cat.pushKey]: v }, { ...prefs, [cat.pushKey]: v })
                    }
                  />
                </label>
                <label className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
                  In-app
                  <SettingsSwitch
                    checked={Boolean(prefs[cat.inAppKey])}
                    disabled={!canEdit || pending}
                    label={`${cat.title} in-app`}
                    onCheckedChange={(v) =>
                      persist({ [cat.inAppKey]: v }, { ...prefs, [cat.inAppKey]: v })
                    }
                  />
                </label>
                <label className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
                  Email
                  <SettingsSwitch
                    checked={Boolean(prefs[cat.emailKey])}
                    disabled={!canEdit || pending}
                    label={`${cat.title} e-mail`}
                    onCheckedChange={(v) =>
                      persist({ [cat.emailKey]: v }, { ...prefs, [cat.emailKey]: v })
                    }
                  />
                </label>
              </div>
            </div>
            <ul className="divide-y divide-line">
              {cat.events.map((ev) => {
                const pair = prefs.events[ev.key] ?? { email: true, inApp: true };
                return (
                  <li
                    key={ev.key}
                    className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <p className="text-[13.5px] text-ink">{ev.label}</p>
                    <div className="flex items-center gap-5">
                      <label className="flex items-center gap-2 text-[12px] text-muted-foreground">
                        Email
                        <SettingsSwitch
                          checked={pair.email}
                          disabled={!canEdit || pending || !prefs[cat.emailKey]}
                          label={`${ev.label} e-mail`}
                          onCheckedChange={(v) => {
                            const nextPair = { ...pair, email: v };
                            persist(
                              { eventKey: ev.key, eventEmail: v, eventInApp: pair.inApp },
                              { ...prefs, events: { ...prefs.events, [ev.key]: nextPair } },
                            );
                          }}
                        />
                      </label>
                      <label className="flex items-center gap-2 text-[12px] text-muted-foreground">
                        In-app
                        <SettingsSwitch
                          checked={pair.inApp}
                          disabled={!canEdit || pending || !prefs[cat.inAppKey]}
                          label={`${ev.label} in-app`}
                          onCheckedChange={(v) => {
                            const nextPair = { ...pair, inApp: v };
                            persist(
                              { eventKey: ev.key, eventEmail: pair.email, eventInApp: v },
                              { ...prefs, events: { ...prefs.events, [ev.key]: nextPair } },
                            );
                          }}
                        />
                      </label>
                    </div>
                  </li>
                );
              })}
            </ul>
            {cat.key === "supplier" ? (
              <div className="border-t border-line px-5 py-4">
                <label className="text-[13px] text-muted-foreground">
                  Seuil de hausse fournisseur
                  <span className="mt-1 flex max-w-[140px] items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      disabled={!canEdit || pending}
                      defaultValue={prefs.supplierThresholdPct}
                      className="h-10 w-full rounded-xl border border-line bg-surface px-3 text-[14px] text-ink tabular-nums"
                      onBlur={(e) => {
                        const n = Number(e.target.value);
                        if (!Number.isFinite(n) || n === prefs.supplierThresholdPct) return;
                        persist({ supplierThresholdPct: n }, { ...prefs, supplierThresholdPct: n });
                      }}
                    />
                    <span className="text-ink">%</span>
                  </span>
                </label>
              </div>
            ) : null}
          </div>
        ))}
      </section>
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

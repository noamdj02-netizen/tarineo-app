"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { changePassword, updateProfile, uploadAvatar } from "./actions";
import { LOCALE_LABEL, type Locale } from "@/lib/i18n";
import { prepareAvatarFile } from "@/lib/image/prepare-avatar";
import { cn } from "@/lib/utils";

export function AvatarForm({
  avatarUrl,
  initial,
}: {
  avatarUrl: string | null;
  initial: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState(avatarUrl);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(avatarUrl);
  }, [avatarUrl]);

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => input.current?.click()}
        aria-label="Changer la photo"
        className="relative grid size-20 flex-none place-items-center overflow-hidden rounded-pill bg-ink font-mono text-[22px] text-accent-ink"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element -- photo utilisateur, URL publique
          <img src={preview} alt="" className="size-full object-cover" />
        ) : (
          initial
        )}
      </button>
      <div className="min-w-0">
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(e) => {
            const raw = e.target.files?.[0];
            if (!raw) return;
            setError(null);
            const localUrl = URL.createObjectURL(raw);
            setPreview(localUrl);
            start(async () => {
              try {
                const file = await prepareAvatarFile(raw);
                const data = new FormData();
                data.set("file", file);
                const res = await uploadAvatar(data);
                if (!res.ok) {
                  setError(res.error);
                  setPreview(avatarUrl);
                  return;
                }
                router.refresh();
              } catch (err) {
                setError(err instanceof Error ? err.message : "Photo impossible à traiter.");
                setPreview(avatarUrl);
              } finally {
                URL.revokeObjectURL(localUrl);
              }
            });
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => input.current?.click()}
          className="text-[14px] font-medium underline-offset-4 hover:underline"
        >
          {pending ? "Envoi…" : "Ajouter ou changer la photo"}
        </button>
        <p className="mt-1 text-[13px] text-muted-foreground">JPEG, PNG ou WebP · 2 Mo max</p>
        {error ? <p className="mt-1 text-[13px] text-st-fini-ink">{error}</p> : null}
      </div>
    </div>
  );
}

export function NameForm({ firstName, email }: { firstName: string; email: string }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const first = String(new FormData(e.currentTarget).get("firstName") ?? "");
        setMsg(null);
        setOk(false);
        start(async () => {
          const res = await updateProfile({ firstName: first });
          if (res.ok) setOk(true);
          else setMsg(res.error);
        });
      }}
    >
      <label className="flex flex-col gap-1.5 text-[13.5px] font-medium">
        Prénom
        <input
          name="firstName"
          defaultValue={firstName}
          required
          maxLength={60}
          className="min-h-12 rounded-[14px] border border-line bg-surface-2 px-4 text-[15px] outline-none focus:border-ink/25 focus:bg-surface"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-[13.5px] font-medium">
        Email
        <input
          value={email}
          readOnly
          className="min-h-12 rounded-[14px] border border-line bg-surface-2 px-4 text-[15px] text-muted-foreground"
        />
      </label>
      {msg ? <p className="text-[13px] text-st-fini-ink">{msg}</p> : null}
      {ok ? <p className="text-[13px] text-st-focus-ink">Enregistré.</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="btn-dark inline-flex min-h-11 w-fit items-center gap-2 rounded-pill px-5 text-[14px] font-medium disabled:opacity-60"
      >
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
        Enregistrer
      </button>
    </form>
  );
}

export function LocaleForm({ locale }: { locale: Locale }) {
  const [pending, start] = useTransition();
  return (
    <div className="flex gap-2">
      {(["fr", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              await updateProfile({ locale: l });
            })
          }
          className={cn(
            "min-h-11 rounded-pill px-4 text-[14px] font-medium",
            locale === l ? "bg-ink text-accent-ink" : "border border-line hover:bg-accent-soft",
          )}
        >
          {LOCALE_LABEL[l]}
        </button>
      ))}
    </div>
  );
}

export function PasswordForm() {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        setMsg(null);
        setOk(false);
        start(async () => {
          const res = await changePassword({
            password: String(f.get("password") ?? ""),
            confirm: String(f.get("confirm") ?? ""),
          });
          if (res.ok) {
            setOk(true);
            e.currentTarget.reset();
          } else setMsg(res.error);
        });
      }}
    >
      <label className="flex flex-col gap-1.5 text-[13.5px] font-medium">
        Nouveau mot de passe
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className="min-h-12 rounded-[14px] border border-line bg-surface-2 px-4 text-[15px] outline-none focus:border-ink/25 focus:bg-surface"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-[13.5px] font-medium">
        Confirme-le
        <input
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          className="min-h-12 rounded-[14px] border border-line bg-surface-2 px-4 text-[15px] outline-none focus:border-ink/25 focus:bg-surface"
        />
      </label>
      {msg ? <p className="text-[13px] text-st-fini-ink">{msg}</p> : null}
      {ok ? <p className="text-[13px] text-st-focus-ink">Mot de passe mis à jour.</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="btn-dark inline-flex min-h-11 w-fit items-center rounded-pill px-5 text-[14px] font-medium disabled:opacity-60"
      >
        Changer le mot de passe
      </button>
    </form>
  );
}

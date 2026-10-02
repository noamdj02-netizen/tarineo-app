"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

export function SettingsSaveForm({
  action,
  children,
  disabled,
}: {
  action: (form: FormData) => Promise<{ ok: true } | { ok: false; error: string }>;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (disabled) return;
        const fd = new FormData(e.currentTarget);
        setMsg(null);
        setErr(null);
        start(async () => {
          const res = await action(fd);
          if (!res.ok) {
            setErr(res.error);
            return;
          }
          setMsg("✓ Modifications enregistrées");
        });
      }}
    >
      <fieldset disabled={disabled || pending} className="flex flex-col gap-4 disabled:opacity-70">
        {children}
      </fieldset>
      {err ? <p className="text-[13px] text-destructive">{err}</p> : null}
      {msg ? <p className="text-[13px] text-st-focus-ink">{msg}</p> : null}
      <Button type="submit" disabled={disabled || pending} className="w-fit rounded-full">
        {pending ? "Enregistrement…" : "Enregistrer les modifications"}
      </Button>
    </form>
  );
}

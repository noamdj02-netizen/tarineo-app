"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useId, useState } from "react";
import { TarineoHdMascot, type TarineoHdMascotName } from "@/components/tarineo-hd-mascot";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field as UiField,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const inputClass = "h-11 rounded-[18px] text-[15px]";

export function AuthCard({
  mascot,
  label,
  title,
  text,
  children,
  footer,
}: {
  mascot: TarineoHdMascotName;
  label: string;
  title: string;
  text?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Card className="gap-0 overflow-hidden rounded-[28px] border-0 bg-surface py-0 shadow-lift ring-1 ring-line">
        <CardHeader className="relative grid-cols-1 gap-0 overflow-hidden rounded-t-[28px] border-b border-line bg-surface px-8 pt-8 pb-4">
          <div className="flex max-w-[240px] min-w-0 flex-col gap-3">
            <p className="mono-label">{`/ ${label} ///`}</p>
            <CardTitle className="font-display text-[30px] font-semibold leading-[1.06] tracking-[-0.045em]">
              {title}
            </CardTitle>
            {text ? (
              <CardDescription className="text-[14.5px] leading-[23.5px]">{text}</CardDescription>
            ) : null}
          </div>
          <CardAction className="pointer-events-none absolute top-0 right-0 col-start-auto row-start-auto h-[163px] w-[140px] self-auto">
            <TarineoHdMascot name={mascot} priority className="h-full w-full" />
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 px-8 pt-6 pb-8">{children}</CardContent>
      </Card>
      {footer ? <p className="text-center text-[14px] text-muted-foreground">{footer}</p> : null}
    </div>
  );
}

export function AuthFieldGroup({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <FieldGroup className={cn("gap-4", className)}>{children}</FieldGroup>;
}

export function Field({
  label,
  hint,
  id: idProp,
  invalid,
  className,
  ...props
}: React.ComponentProps<typeof Input> & {
  label: string;
  hint?: string;
  invalid?: boolean;
}) {
  const autoId = useId();
  const id = idProp ?? autoId;
  return (
    <UiField data-invalid={invalid || undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        aria-invalid={invalid || undefined}
        className={cn(inputClass, className)}
        {...props}
      />
      {hint ? <FieldDescription>{hint}</FieldDescription> : null}
    </UiField>
  );
}

export function PasswordField({
  label = "Mot de passe",
  hint,
  id: idProp,
  invalid,
  ...props
}: React.ComponentProps<typeof Input> & {
  label?: string;
  hint?: string;
  invalid?: boolean;
}) {
  const [show, setShow] = useState(false);
  const autoId = useId();
  const id = idProp ?? autoId;
  return (
    <UiField data-invalid={invalid || undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <InputGroup className={cn(inputClass, "h-11")}>
        <InputGroupInput
          id={id}
          type={show ? "text" : "password"}
          aria-invalid={invalid || undefined}
          {...props}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            {show ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      {hint ? <FieldDescription>{hint}</FieldDescription> : null}
    </UiField>
  );
}

export function SubmitButton({
  busy,
  disabled,
  children,
}: {
  busy: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="submit"
      disabled={busy || disabled}
      size="lg"
      className="h-12 w-full rounded-full text-[15px] font-medium"
    >
      {busy ? <Loader2 className="animate-spin" data-icon="inline-start" aria-hidden /> : null}
      {children}
    </Button>
  );
}

export function FormMessage({ tone = "error", children }: { tone?: "error" | "ok"; children: React.ReactNode }) {
  if (tone === "ok") {
    return (
      <Alert className="border-st-focus/30 bg-st-focus-soft text-st-focus-ink">
        <AlertTitle className="sr-only">Succès</AlertTitle>
        <AlertDescription className="text-[13.5px] leading-snug">{children}</AlertDescription>
      </Alert>
    );
  }
  return (
    <Alert variant="destructive" className="border-destructive/20 bg-st-fini-soft text-st-fini-ink">
      <AlertTitle className="sr-only">Erreur</AlertTitle>
      <AlertDescription className="text-[13.5px] leading-snug text-st-fini-ink">{children}</AlertDescription>
    </Alert>
  );
}

export function Divider() {
  return <FieldSeparator>ou</FieldSeparator>;
}

/** Bouton Google : redirige vers Google puis revient par /auth/callback. */
export function GoogleButton({ next }: { next: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  async function go() {
    setBusy(true);
    setError(false);
    const { error } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) {
      setBusy(false);
      setError(true);
    }
  }
  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="outline"
        size="lg"
        disabled={busy}
        onClick={go}
        className="h-12 w-full rounded-full bg-surface text-[15px] font-medium shadow-soft"
      >
        {busy ? (
          <Loader2 className="animate-spin" data-icon="inline-start" aria-hidden />
        ) : (
          <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden>
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.7Z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24Z"
            />
            <path
              fill="#FBBC05"
              d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1Z"
            />
            <path
              fill="#EA4335"
              d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9Z"
            />
          </svg>
        )}
        Continuer avec Google
      </Button>
      {error ? (
        <FormMessage>Connexion Google impossible. Réessaie, ou utilise ton email.</FormMessage>
      ) : null}
    </div>
  );
}

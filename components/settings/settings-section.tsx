import type { ReactNode } from "react";

export function SettingsSection({
  title,
  description,
  scope,
  children,
}: {
  title: string;
  description?: string;
  scope?: "entreprise" | "utilisateur";
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        {scope ? (
          <p className="text-[11px] font-semibold tracking-[0.08em] text-brand-orange uppercase">
            {scope === "entreprise" ? "Configuration entreprise" : "Préférences personnelles"}
          </p>
        ) : null}
        <h2 className="font-display text-[22px] font-semibold tracking-tight text-ink">{title}</h2>
        {description ? <p className="max-w-[52ch] text-[14px] text-muted-foreground">{description}</p> : null}
      </header>
      {children}
    </div>
  );
}

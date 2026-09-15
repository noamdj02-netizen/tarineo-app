import type { ReactNode } from "react";

interface Props {
  eyebrow?: string;
  titre: ReactNode;
  description?: string;
  align?: "left" | "center";
  variant?: "dark" | "light";
  className?: string;
}

export function LandingSectionHeader({
  eyebrow,
  titre,
  description,
  align = "left",
  variant = "dark",
  className = "",
}: Props) {
  const centrer = align === "center";
  const clair = variant === "light";

  return (
    <header className={`${centrer ? "text-center" : ""} ${className}`}>
      {eyebrow && (
        <p
          className={`mb-3 text-[0.68rem] font-bold uppercase tracking-[0.16em] ${
            clair ? "landing-gradient-text" : "text-accent"
          }`}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={`mb-4 text-[1.85rem] font-extrabold leading-[1.08] sm:text-4xl ${
          clair ? "text-[var(--landing-text)]" : "text-white"
        } ${centrer ? "mx-auto max-w-xl" : "max-w-xl"}`}
      >
        {titre}
      </h2>
      {description && (
        <p
          className={`text-base leading-relaxed ${clair ? "text-[var(--landing-muted)]" : "text-muted"} ${
            centrer ? "mx-auto max-w-lg" : "max-w-lg"
          }`}
        >
          {description}
        </p>
      )}
    </header>
  );
}

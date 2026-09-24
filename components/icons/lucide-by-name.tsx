import "server-only";
import { icons, type LucideProps } from "lucide-react";

/** Noms du HTML d'origine renommés depuis dans lucide-react. */
const ALIASES: Record<string, string> = {
  "circle-help": "circle-question-mark",
  "help-circle": "circle-question-mark",
};

/** « arrow-right » → « ArrowRight » */
function pascal(name: string) {
  return (ALIASES[name] ?? name).replace(/(^|-)([a-z0-9])/g, (_, __, c: string) =>
    c.toUpperCase(),
  );
}

/**
 * Icône lucide à partir de son nom (comme data-lucide="…" dans le HTML d'origine).
 * Côté serveur uniquement : la liste complète des icônes n'est jamais envoyée au navigateur.
 */
export function LucideByName({ name, ...props }: { name: string } & LucideProps) {
  const Icon = icons[pascal(name) as keyof typeof icons];
  return Icon ? <Icon aria-hidden {...props} /> : null;
}

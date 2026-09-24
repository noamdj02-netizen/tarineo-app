import "server-only";
import { icons, type LucideProps } from "lucide-react";

/** « arrow-right » → « ArrowRight » */
function pascal(name: string) {
  return name.replace(/(^|-)([a-z0-9])/g, (_, __, c: string) => c.toUpperCase());
}

/**
 * Icône lucide à partir de son nom (comme data-lucide="…" dans le HTML d'origine).
 * Côté serveur uniquement : la liste complète des icônes n'est jamais envoyée au navigateur.
 */
export function LucideByName({ name, ...props }: { name: string } & LucideProps) {
  const Icon = icons[pascal(name) as keyof typeof icons];
  return Icon ? <Icon aria-hidden {...props} /> : null;
}

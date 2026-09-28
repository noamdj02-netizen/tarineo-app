import { PageHeader, type Crumb } from "@/components/app-ui/page-header";
import { TarineoHdMascot, type TarineoHdMascotName } from "@/components/tarineo-hd-mascot";

/**
 * En-tête d’onglet métier : fil d’Ariane, titre produit clair, description, CTA.
 * `tail` est conservé pour compatibilité mais n’est plus concaténé (titres marketing abandonnés).
 */
export function PageHead({
  label,
  title,
  tail: _tail,
  mascot,
  ornament = "none",
  crumbs,
  action,
  children,
}: {
  label: string;
  title: string;
  /** @deprecated Titres marketing — ignoré. */
  tail?: string;
  mascot?: TarineoHdMascotName;
  ornament?: "mascot" | "mark" | "none";
  crumbs?: Crumb[];
  action?: React.ReactNode;
  children?: React.ReactNode;
}) {
  void _tail;
  const trail = crumbs ?? [{ href: "/accueil", label: "Accueil" }, { label }];
  return (
    <div className="relative">
      <PageHeader crumbs={trail} title={title} description={children} action={action} />
      {ornament === "mascot" && mascot ? (
        <TarineoHdMascot
          name={mascot}
          className="pointer-events-none absolute top-0 right-0 hidden h-16 w-[4.5rem] opacity-80 sm:block"
          label=""
        />
      ) : null}
    </div>
  );
}

import { Field as AuthField } from "@/components/auth/auth-ui";
import { FieldGroup } from "@/components/ui/field";
import { LOCALE_LABEL, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function IdentiteScreen({
  first,
  last,
  lang,
  onFirst,
  onLast,
  onLang,
}: {
  first: string;
  last: string;
  lang: Locale;
  onFirst: (v: string) => void;
  onLast: (v: string) => void;
  onLang: (v: Locale) => void;
}) {
  return (
    <>
      <h2 className="font-serif text-[1.7rem] leading-[1.1] tracking-[-0.02em]">
        Comment t’appeler ?
      </h2>
      <p className="mt-2 text-[14.5px] leading-relaxed text-muted-foreground">
        Prénom et nom. On les pose dans ton compte.
      </p>
      <FieldGroup className="mt-6 gap-3">
        <AuthField
          label="Prénom"
          value={first}
          onChange={(e) => onFirst(e.target.value)}
          autoComplete="given-name"
          required
        />
        <AuthField
          label="Nom"
          value={last}
          onChange={(e) => onLast(e.target.value)}
          autoComplete="family-name"
        />
      </FieldGroup>
      <div className="mt-5 flex gap-2">
        {(Object.keys(LOCALE_LABEL) as Locale[]).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onLang(id)}
            className={cn(
              "pressable rounded-pill border px-3.5 py-1.5 text-[13.5px]",
              lang === id ? "border-ink bg-ink text-accent-ink" : "border-line",
            )}
          >
            {LOCALE_LABEL[id]}
          </button>
        ))}
      </div>
    </>
  );
}

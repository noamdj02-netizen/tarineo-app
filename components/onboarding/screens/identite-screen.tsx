import { Field as AuthField } from "@/components/auth/auth-ui";
import { TarineoHdMascot } from "@/components/tarineo-hd-mascot";
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
    <div className="flex flex-col">
      <TarineoHdMascot
        name="03-salut"
        className="mb-5 h-24 w-28 self-center sm:h-28 sm:w-32"
        label=""
      />
      <p className="mono-label mb-2">/ Bienvenue ///</p>
      <h1 className="font-display text-[clamp(1.65rem,5.2vw,2.15rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-ink text-balance">
        Protégez votre marge dès le premier PDF.
      </h1>
      <p className="mt-3 max-w-[36ch] text-[15px] leading-relaxed text-muted-foreground">
        Deux minutes pour personnaliser TARINEO — puis déposez un devis distributeur.
      </p>

      <div className="mt-8 border-t border-line/80 pt-6">
        <h2 className="font-serif text-[1.4rem] leading-[1.12] tracking-[-0.02em] text-ink">
          Comment vous appeler&nbsp;?
        </h2>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">
          Prénom et nom sur vos devis et factures clients.
        </p>
        <FieldGroup className="mt-5 gap-3">
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
        <div className="mt-5">
          <p className="mb-2 text-[12px] font-medium text-muted-foreground">Langue</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(LOCALE_LABEL) as Locale[]).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => onLang(id)}
                className={cn(
                  "pressable min-h-10 rounded-pill border px-4 text-[13.5px] font-medium transition-colors",
                  lang === id
                    ? "border-tarineo-orange bg-tarineo-orange text-white"
                    : "border-line bg-surface text-ink hover:border-ink/25",
                )}
              >
                {LOCALE_LABEL[id]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

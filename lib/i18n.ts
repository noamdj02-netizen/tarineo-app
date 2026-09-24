export type Locale = "fr" | "en";

export function isLocale(v: unknown): v is Locale {
  return v === "fr" || v === "en";
}

export const LOCALE_LABEL: Record<Locale, string> = { fr: "Français", en: "English" };

/** Affiché une fois, juste après un code ou un lien d’email. */
export const VERIFIED_COOKIE = "navpit_verified";

export type VerifiedKind = "signup" | "login";

export function verifiedKind(value: string | null | undefined): VerifiedKind | null {
  return value === "signup" || value === "login" ? value : null;
}

export function kindFromEmailType(type: string | null | undefined): VerifiedKind | null {
  if (type === "signup") return "signup";
  if (type === "magiclink" || type === "email") return "login";
  return null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

/** Téléphone FR : 10 chiffres (0X…) ou +33 suivi de 9 chiffres. */
export function normalizeFrenchPhone(raw: string): string {
  let digits = raw.replace(/[\s.\-()]/g, "");
  if (digits.startsWith("+33")) digits = `0${digits.slice(3)}`;
  if (digits.startsWith("0033")) digits = `0${digits.slice(4)}`;
  return digits;
}

export function isValidFrenchPhone(raw: string): boolean {
  const digits = normalizeFrenchPhone(raw);
  if (!/^0[1-9]\d{8}$/.test(digits)) return false;
  return true;
}

export function isValidEmail(raw: string): boolean {
  const email = raw.trim();
  if (email.length > 254) return false;
  return EMAIL_RE.test(email);
}

export type ArtisanContactFields = {
  prenom: string;
  metier: string;
  telephone: string;
  email: string;
};

export function validateArtisanContact(
  input: ArtisanContactFields,
): { ok: true; data: ArtisanContactFields } | { ok: false; message: string } {
  const prenom = input.prenom.trim();
  const metier = input.metier.trim();
  const telephone = input.telephone.trim();
  const email = input.email.trim();

  if (!prenom || prenom.length < 2) {
    return { ok: false, message: "Indiquez votre prénom (au moins 2 caractères)." };
  }
  if (!metier || metier.length < 2) {
    return { ok: false, message: "Indiquez votre métier (ex. plombier, électricien)." };
  }
  if (!telephone) {
    return { ok: false, message: "Indiquez votre numéro de téléphone." };
  }
  if (!isValidFrenchPhone(telephone)) {
    return {
      ok: false,
      message: "Numéro invalide. Utilisez un mobile ou fixe français (10 chiffres).",
    };
  }
  if (!email) {
    return { ok: false, message: "Indiquez votre adresse e-mail." };
  }
  if (!isValidEmail(email)) {
    return { ok: false, message: "Adresse e-mail invalide." };
  }

  return {
    ok: true,
    data: {
      prenom: prenom.slice(0, 80),
      metier: metier.slice(0, 120),
      telephone: normalizeFrenchPhone(telephone).slice(0, 20),
      email: email.slice(0, 254),
    },
  };
}

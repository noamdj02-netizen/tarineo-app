export function normaliserReference(reference: string): string {
  return reference
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

// Pour comparer les prix entre documents sans dépendre d'une liste fermée de
// distributeurs : "Rexel", "REXEL " ou "Rexel." doivent être reconnus comme le même
// distributeur. Contrairement à normaliserReference, on garde les espaces (un seul,
// entre les mots) car les noms de distributeurs sont souvent composés (« Point P »).
export function normaliserDistributeur(distributor: string): string {
  return distributor
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.,]+$/g, "");
}

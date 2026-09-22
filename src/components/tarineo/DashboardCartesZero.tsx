import { CarteResume } from "@/components/tarineo/CarteResume";

export function DashboardCartesZero({
  documents = 0,
  documentsHint,
}: {
  documents?: number;
  documentsHint?: string;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <CarteResume label="Documents" valeur={String(documents)} hint={documentsHint} />
      <CarteResume label="Montant HT" valeur="0 €" />
      <CarteResume label="Hausses" valeur="0" />
      <CarteResume label="Enseignes" valeur="0" />
    </div>
  );
}

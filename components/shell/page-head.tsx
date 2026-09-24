/** Titre + chapeau d'un onglet (classes .sec et .lead du HTML d'origine). */
export function PageHead({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <>
      <h2 className="sec">{title}</h2>
      {children ? <p className="lead">{children}</p> : null}
    </>
  );
}

/** Espace réservé pour les onglets pas encore migrés. */
export function Soon({ step }: { step: number }) {
  return (
    <p className="status">
      Contenu migré à l’étape {step}.
    </p>
  );
}

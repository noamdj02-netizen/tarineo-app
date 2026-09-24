/** La fiche projet s'ouvre en panneau (@modal) par-dessus la liste. */
export default function ProjetsLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}

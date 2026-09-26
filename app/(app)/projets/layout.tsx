/** Liste et fiche : pages pleines. `modal` reste typé le temps que le cache Next lâche l’ancien slot. */
export default function ProjetsLayout({
  children,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return children;
}

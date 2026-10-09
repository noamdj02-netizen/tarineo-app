/** Pas de PageEnter ici — déjà dans `app/(app)/layout.tsx` (évite double POP_PAGE). */
export default function AppTemplate({ children }: { children: React.ReactNode }) {
  return children;
}

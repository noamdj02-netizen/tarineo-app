/** Placeholder silencieux — évite le spinner qui fait « sauter » l'UI à chaque router.refresh(). */
export default function AppLoading() {
  return <div className="min-h-[50vh] w-full" aria-hidden="true" />;
}

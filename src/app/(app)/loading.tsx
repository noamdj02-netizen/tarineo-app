/** Spinner discret dans la zone contenu — le shell (sidebar) reste visible. */
export default function AppLoading() {
  return (
    <div
      className="flex min-h-[40vh] w-full items-center justify-center"
      role="status"
      aria-busy="true"
      aria-label="Chargement"
    >
      <div className="size-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary motion-reduce:animate-none" />
    </div>
  );
}

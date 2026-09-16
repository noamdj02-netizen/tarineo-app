export default function AppLoading() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-6">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent"
        aria-hidden
      />
      <p className="text-sm text-muted-foreground">Chargement…</p>
    </div>
  );
}

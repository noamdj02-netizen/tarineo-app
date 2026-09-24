export default function AppLoading() {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-6 pb-8">
      <div className="flex flex-col gap-3">
        <div className="h-3 w-24 animate-pulse rounded bg-surface-2" />
        <div className="h-10 max-w-md animate-pulse rounded-xl bg-surface-2" />
        <div className="h-4 max-w-sm animate-pulse rounded bg-surface-2/80" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card-soft h-40 animate-pulse bg-surface-2/50" />
        <div className="card-soft h-40 animate-pulse bg-surface-2/50" />
      </div>
      <p className="mono-label sr-only">Chargement…</p>
    </div>
  );
}

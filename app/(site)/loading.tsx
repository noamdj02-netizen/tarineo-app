export default function SiteLoading() {
  return (
    <div role="status" aria-live="polite" className="mx-auto flex w-full max-w-[860px] flex-col items-center gap-4 px-6 py-24">
      <div className="h-4 w-32 animate-pulse rounded bg-surface-2" />
      <div className="h-12 w-full max-w-lg animate-pulse rounded-2xl bg-surface-2" />
      <div className="h-24 w-full max-w-xl animate-pulse rounded-2xl bg-surface-2/80" />
      <p className="mono-label sr-only">Chargement…</p>
    </div>
  );
}

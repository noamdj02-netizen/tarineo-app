export default function AuthLoading() {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-4">
      <div className="card-soft h-[420px] animate-pulse rounded-[28px] bg-surface-2/60" />
      <div className="mx-auto h-4 w-48 animate-pulse rounded bg-surface-2" />
      <p className="mono-label sr-only">Chargement…</p>
    </div>
  );
}

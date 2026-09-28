import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonHeader() {
  return (
    <div className="mb-8 flex flex-col gap-3">
      <Skeleton className="h-3 w-28 rounded-[6px] bg-surface-2" />
      <Skeleton className="h-8 w-56 rounded-[8px] bg-surface-2" />
      <Skeleton className="h-4 w-80 max-w-full rounded-[6px] bg-surface-2" />
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={`rounded-card border border-line bg-surface p-5 ${className ?? ""}`}>
      <Skeleton className="h-3 w-24 rounded-[6px] bg-surface-2" />
      <Skeleton className="mt-3 h-6 w-40 rounded-[6px] bg-surface-2" />
      <Skeleton className="mt-2 h-4 w-full rounded-[6px] bg-surface-2" />
    </div>
  );
}

export function SkeletonList({ rows = 4 }: { rows?: number }) {
  return (
    <ul className="flex flex-col gap-2">
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="rounded-[14px] border border-line bg-surface px-4 py-3">
          <Skeleton className="h-4 w-2/3 rounded-[6px] bg-surface-2" />
          <Skeleton className="mt-2 h-3 w-1/3 rounded-[6px] bg-surface-2" />
        </li>
      ))}
    </ul>
  );
}

export function SkeletonTable({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-card border border-line">
      <div className="border-b border-line bg-surface-2/60 px-4 py-2.5">
        <Skeleton className="h-3 w-48 rounded-[6px] bg-surface-2" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 border-b border-line px-4 py-3.5 last:border-0">
          <Skeleton className="h-4 w-24 rounded-[6px] bg-surface-2" />
          <Skeleton className="h-4 flex-1 rounded-[6px] bg-surface-2" />
          <Skeleton className="h-4 w-16 rounded-[6px] bg-surface-2" />
        </div>
      ))}
    </div>
  );
}

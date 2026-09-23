import { Skeleton } from "@/components/ui/skeleton";

/** Shimmer de chargement — remplace le blanc pendant les navigations. */
export function PageSkeleton({ variant = "liste" }: { variant?: "accueil" | "liste" | "profil" }) {
  if (variant === "accueil") {
    return (
      <div className="flex flex-col gap-5 pb-2 lg:hidden" aria-hidden="true">
        <div className="flex items-center gap-3">
          <Skeleton className="size-11 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-5 w-40 rounded-full" />
            <Skeleton className="h-3 w-56 rounded-full" />
          </div>
          <Skeleton className="size-10 rounded-full" />
        </div>
        <Skeleton className="h-[280px] w-full rounded-[28px]" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-28 rounded-full" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-[110px] rounded-[20px]" />
            <Skeleton className="h-[110px] rounded-[20px]" />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-32 rounded-full" />
          <Skeleton className="h-[180px] rounded-[20px]" />
        </div>
      </div>
    );
  }

  if (variant === "profil") {
    return (
      <div className="flex flex-col gap-5 pb-8 lg:hidden" aria-hidden="true">
        <div className="flex items-center justify-between gap-3 pt-1">
          <Skeleton className="h-7 w-28 rounded-full" />
          <Skeleton className="size-11 rounded-full" />
        </div>
        <div className="flex flex-col items-center gap-3 pt-2">
          <Skeleton className="size-[76px] rounded-full" />
          <Skeleton className="h-6 w-32 rounded-full" />
          <Skeleton className="h-4 w-44 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[140px] w-full rounded-[20px]" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 lg:hidden" aria-hidden="true">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-7 w-36 rounded-full" />
        <Skeleton className="h-9 w-24 rounded-full" />
      </div>
      <Skeleton className="h-10 w-full rounded-full" />
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-[72px] w-full rounded-[20px]" />
      ))}
      {/* Desktop */}
      <div className="mt-4 hidden flex-col gap-4 lg:flex">
        <Skeleton className="h-8 w-48 rounded-full" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-[20px]" />
          ))}
        </div>
      </div>
    </div>
  );
}

import { SkeletonHeader, SkeletonTable } from "@/components/app-ui/loading";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <SkeletonHeader />
      <SkeletonTable rows={6} />
    </div>
  );
}

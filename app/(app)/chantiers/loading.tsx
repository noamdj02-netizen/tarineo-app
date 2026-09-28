import { SkeletonHeader, SkeletonList } from "@/components/app-ui/loading";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <SkeletonHeader />
      <SkeletonList rows={5} />
    </div>
  );
}

import { PageSkeleton } from "@/components/tarineo/mobile/PageSkeleton";

/** Shimmer global — évite le blanc pendant les navigations. */
export default function AppLoading() {
  return <PageSkeleton variant="liste" />;
}

import { HomeDashboardClient, type HomeDashboardClientProps } from "@/components/home/home-dashboard-client";
import type { DashboardPrefs } from "@/lib/home/dashboard-prefs";

export type HomeDashboardProps = Omit<HomeDashboardClientProps, "initialPrefs"> & {
  initialPrefs: DashboardPrefs;
};

export function HomeDashboard(props: HomeDashboardProps) {
  return <HomeDashboardClient {...props} />;
}

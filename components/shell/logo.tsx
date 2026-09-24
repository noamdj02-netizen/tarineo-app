import { SiteLogo } from "@/components/site/site-logo";
import { cn } from "@/lib/utils";

/** Logo Navpit (icône + wordmark). */
export function Logo({ className }: { className?: string }) {
  return <SiteLogo href="/accueil" className={cn("min-h-11", className)} />;
}

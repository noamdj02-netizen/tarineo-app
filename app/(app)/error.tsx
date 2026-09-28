"use client";

import { ErrorState } from "@/components/app-ui/error-state";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Impossible de charger cette page"
      text="Une erreur est survenue. Réessayez."
      onRetry={reset}
    />
  );
}

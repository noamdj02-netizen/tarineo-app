import { redirect } from "next/navigation";
import { integrationsHubUrl } from "@/lib/integrations/hub";

/** Redirection vers le hub unique (Phase 1). */
export default function ParametresIntegrationsRedirect() {
  redirect(integrationsHubUrl());
}

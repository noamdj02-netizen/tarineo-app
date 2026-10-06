import "server-only";

/**
 * Point d’entrée serveur des adapters d’intégration (tests, snapshot vérifié).
 * Les composants client importent `@/lib/integrations/client` ou `hub`.
 */
export { testIntegrationConnection } from "./test-connection";
export { integrationSupportsConnectionTest } from "./client";
export { loadVerifiedIntegrationsSnapshot } from "./verified-snapshot";
export { INTEGRATIONS_HUB_PATH, integrationsHubUrl, googleOAuthHref } from "./hub";
export type { ConnectionTestResult, ConnectionTestOutcome } from "./types";
export { tarineoEmailPlatformConnected } from "./providers/tarineo-email";
export { INTEGRATION_PROVIDER_META } from "./providers-meta";

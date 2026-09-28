export async function register() {
  if (process.env.NEXT_RUNTIME === "edge") return;
  const { isBuildPhase, logMissingConfig, missingProductionKeys, shouldEnforceConfig } =
    await import("./lib/runtime-config");
  if (isBuildPhase() || !shouldEnforceConfig()) return;
  logMissingConfig("démarrage", missingProductionKeys("all"));
}

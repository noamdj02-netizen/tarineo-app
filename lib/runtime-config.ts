/** Déploiement Vercel (preview + prod) ou `next start`. Pas `next build`. */
export function isBuildPhase() {
  const phase = process.env.NEXT_PHASE ?? "";
  return phase.includes("build") || phase.includes("compile");
}

export function isDeployedRuntime() {
  const vercel = process.env.VERCEL_ENV;
  if (vercel === "production" || vercel === "preview") return true;
  return process.env.NODE_ENV === "production";
}

export function shouldEnforceConfig() {
  return isDeployedRuntime() && !isBuildPhase();
}

/** Noms uniquement — jamais les valeurs. */
export function missingProductionKeys(scope: "all" | "stripe" | "email" | "supabase" | "app" = "all") {
  const missing: string[] = [];
  const app = process.env.NEXT_PUBLIC_APP_URL?.trim() ?? "";
  const needApp = scope === "all" || scope === "app" || scope === "stripe" || scope === "email";
  if (needApp) {
    if (!app) missing.push("NEXT_PUBLIC_APP_URL");
    else if (/localhost|127\.0\.0\.1/i.test(app)) missing.push("NEXT_PUBLIC_APP_URL");
  }
  if (scope === "all" || scope === "email") {
    if (!process.env.EMAIL_FROM?.trim()) missing.push("EMAIL_FROM");
    if (!process.env.RESEND_API_KEY?.trim()) missing.push("RESEND_API_KEY");
  }
  if (scope === "all" || scope === "stripe") {
    if (!process.env.STRIPE_SECRET_KEY?.trim()) missing.push("STRIPE_SECRET_KEY");
    if (!process.env.STRIPE_WEBHOOK_SECRET?.trim()) missing.push("STRIPE_WEBHOOK_SECRET");
  }
  if (scope === "all" || scope === "supabase") {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()) missing.push("NEXT_PUBLIC_SUPABASE_URL");
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return missing;
}

export function logMissingConfig(context: string, missing: string[]) {
  if (!missing.length) return;
  console.error(`[config] ${context} : manquant ${missing.join(", ")}`);
}

export function assertSensitiveConfig(context: string, scope: "all" | "stripe" | "email" | "supabase" | "app" = "all") {
  if (!shouldEnforceConfig()) return;
  const missing = missingProductionKeys(scope);
  if (!missing.length) return;
  logMissingConfig(context, missing);
  throw new Error("Configuration serveur incomplète.");
}

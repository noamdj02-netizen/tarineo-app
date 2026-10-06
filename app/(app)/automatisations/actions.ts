"use server";

import { revalidatePath } from "next/cache";
import { mergeMarginConfig, mergeQuoteFollowupConfig } from "@/lib/automation/config";
import { ensureAutomationDefinitions, updateAutomationDefinition } from "@/lib/automation/definitions";
export async function saveAutomationsAction(form: FormData) {
  await ensureAutomationDefinitions();

  const quoteEnabled = form.get("quoteEnabled") === "on";
  const quoteAuto = form.get("quoteAutoSchedule") === "on";
  const firstDelayDays = Number(form.get("firstDelayDays") ?? 3);
  const maxSequences = Number(form.get("maxSequences") ?? 2);
  const betweenDays = Number(form.get("betweenSequencesDays") ?? 7);

  const marginEnabled = form.get("marginEnabled") === "on";
  const floorRaw = String(form.get("floorMarginPct") ?? "").trim();
  const floorMarginPct = floorRaw === "" ? null : Number(floorRaw);

  const quoteConfig = mergeQuoteFollowupConfig({
    autoScheduleEnabled: quoteAuto,
    firstDelayDays,
    maxSequences,
    betweenSequencesDays: betweenDays,
  });

  const marginConfig = mergeMarginConfig({
    enabled: true,
    floorMarginPct: Number.isFinite(floorMarginPct) ? floorMarginPct : null,
    notifyInApp: true,
  });

  const quote = await updateAutomationDefinition({
    slug: "quote_followup",
    enabled: quoteEnabled,
    config: quoteConfig,
  });
  if (!quote.ok) return quote;

  const margin = await updateAutomationDefinition({
    slug: "margin_below_target",
    enabled: marginEnabled,
    config: marginConfig,
  });
  if (!margin.ok) return margin;

  revalidatePath("/automatisations");
  return { ok: true as const };
}

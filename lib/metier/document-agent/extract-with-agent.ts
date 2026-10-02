import "server-only";
import { extractDocument } from "@/lib/metier/extract";
import type { ExtractResult } from "@/lib/metier/types";
import { buildDocumentRecap } from "@/lib/metier/document-agent/assess-recap";
import type { DocumentAgentMeta, DocumentRecap } from "@/lib/metier/document-agent/types";
import { loadVendorProfile } from "@/lib/metier/document-agent/profiles";
import { resolveVendorKey, vendorDisplayName } from "@/lib/metier/document-agent/vendor-key";

export type IngestWithAgentResult = {
  extracted: ExtractResult;
  agent: DocumentAgentMeta;
  recap: DocumentRecap;
};

export async function ingestDocumentWithAgent(input: {
  fileName: string;
  mime: string;
  base64: string;
}): Promise<IngestWithAgentResult> {
  const guessKey = resolveVendorKey("", input.fileName);
  const guessProfile = await loadVendorProfile(guessKey, null);
  const promptAddon = guessProfile?.prompt_addon ?? "";

  const extracted = await extractDocument({
    ...input,
    promptAddon,
  });

  const vendorKey = resolveVendorKey(extracted.party_name, input.fileName);
  const profile = vendorKey !== guessKey ? await loadVendorProfile(vendorKey, extracted.kind) : guessProfile;
  const confidence =
    vendorKey !== "unknown" ? (profile?.sample_count && profile.sample_count > 2 ? "high" : "medium") : "low";

  const agent: DocumentAgentMeta = {
    vendor_key: vendorKey,
    vendor_display_name: profile?.vendor_display_name ?? vendorDisplayName(vendorKey),
    profile_version: profile?.version ?? 0,
    confidence,
  };

  const recap = buildDocumentRecap(extracted, agent, extracted.read_assessment);

  return { extracted, agent, recap };
}

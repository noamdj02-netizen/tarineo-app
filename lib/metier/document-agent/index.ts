export type { DocumentAgentMeta, StructuralHintDelta, VendorDocumentProfile } from "@/lib/metier/document-agent/types";
export { resolveVendorKey, vendorDisplayName } from "@/lib/metier/document-agent/vendor-key";
export { ingestDocumentWithAgent } from "@/lib/metier/document-agent/extract-with-agent";
export { learnFromConfirmation, structuralDiff } from "@/lib/metier/document-agent/learn";
export { isSafeHintDelta, hintDeltaHash } from "@/lib/metier/document-agent/learn-guards";

export type { DevisDraft, DevisLine, DevisSource, QuoteTotals, ClientDraft, ChantierDraft } from "@/lib/metier/devis/types";
export { calculateQuoteTotals, formatEuro, roundMoney } from "@/lib/metier/devis/totals";
export { validateDevisDraft, normalizeDevisLine } from "@/lib/metier/devis/validate";
export { persistDevisDraft } from "@/lib/metier/devis/persist";
export { draftFromProposal, type DevisProposal, type DevisProposalLine } from "@/lib/metier/devis/from-proposal";
export { matchClients, matchChantiers } from "@/lib/metier/devis/match";

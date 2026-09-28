import assert from "node:assert/strict";
import test from "node:test";
import { getToolSpec } from "@/lib/assistant/registry";

const scenarios: { q: string; tool: string }[] = [
  { q: "Quels sont mes chantiers ?", tool: "list_chantiers" },
  { q: "Fais le point sur Martin.", tool: "get_chantier" },
  { q: "Prépare un devis avec les achats du chantier Martin.", tool: "create_devis" },
  { q: "Transforme ce devis en commande.", tool: "create_commande" },
  { q: "Transforme cette commande en facture.", tool: "create_facture" },
  { q: "Quels devis dois-je relancer ?", tool: "list_follow_ups" },
];

for (const s of scenarios) {
  test(`scénario : ${s.q} → tool ${s.tool} déclaré`, () => {
    assert.ok(getToolSpec(s.tool), s.tool);
  });
}

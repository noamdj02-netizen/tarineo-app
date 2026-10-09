import assert from "node:assert/strict";
import test from "node:test";
import { relatedIdsFromDocuments } from "@/lib/metier/list-documents-query";

/**
 * Baseline structurelle (pas de TTFB réseau) :
 * avant optimisation, listDocuments chargeait TOUTES les parties/chantiers du user ;
 * après, seulement les ids référencés par la page de documents.
 *
 * Mesure réelle TTFB /accueil : non exécutée ici (staging requis).
 */

test("baseline — relatedIdsFromDocuments réduit le graphe vs N parties user", () => {
  const allPartyCount = 200;
  const docs = Array.from({ length: 25 }, (_, i) => ({
    party_id: i % 5 === 0 ? `p-${i % 5}` : `p-${i % 5}`,
    chantier_id: i % 3 === 0 ? `c-${i % 3}` : null,
  }));
  const t0 = performance.now();
  const rel = relatedIdsFromDocuments(docs);
  const ms = performance.now() - t0;
  assert.ok(rel.partyIds.length <= 5);
  assert.ok(rel.chantierIds.length <= 3);
  assert.ok(rel.partyIds.length < allPartyCount, "doit être strictement plus petit que le graphe user complet");
  // Garde-fou : helper trivial < 5 ms même sur 25 docs
  assert.ok(ms < 5, `helper trop lent: ${ms.toFixed(3)}ms`);
  console.log(
    `[perf-baseline] relatedIds docs=${docs.length} parties=${rel.partyIds.length}/${allPartyCount} chantiers=${rel.chantierIds.length} compute=${ms.toFixed(3)}ms`,
  );
});

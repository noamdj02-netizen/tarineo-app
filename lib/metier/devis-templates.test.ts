import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  draftFromSystemTemplate,
  getSystemTemplate,
  getSystemTemplates,
} from "@/lib/metier/devis-templates";
import { validateDevisDraft } from "@/lib/metier/devis/validate";

describe("getSystemTemplates", () => {
  it("retourne les 4 modèles système attendus", () => {
    const t = getSystemTemplates();
    assert.deepEqual(
      t.map((x) => x.id),
      ["blank", "plumbing", "electrical", "earthworks"],
    );
    assert.equal(t[0].title, "Devis vide");
    assert.equal(t[1].title, "Plomberie / sanitaire");
    assert.equal(t[2].title, "Électricité");
    assert.equal(t[3].title, "Terrassement / TP");
  });

  it("n’invente jamais de prix", () => {
    for (const tpl of getSystemTemplates()) {
      for (const line of tpl.lines) {
        assert.equal(line.unitPriceHT, 0);
      }
    }
  });
});

describe("draftFromSystemTemplate", () => {
  it("devis vide avec lines = []", () => {
    const blank = getSystemTemplate("blank");
    assert.ok(blank);
    const draft = draftFromSystemTemplate(blank!, {
      clientName: "Sans client",
      idempotencyKey: "k1",
    });
    assert.equal(draft.source, "manual");
    assert.deepEqual(draft.lines, []);
    const v = validateDevisDraft(draft);
    assert.equal(v.ok, true);
  });

  it("plomberie produit des lignes", () => {
    const tpl = getSystemTemplate("plumbing")!;
    const draft = draftFromSystemTemplate(tpl, { clientId: "c1", clientName: "Dupont" });
    assert.equal(draft.lines.length, 2);
    assert.ok(draft.lines.every((l) => l.unitPriceHT === 0));
    assert.equal(draft.client.id, "c1");
    assert.equal(draft.client.name, "Dupont");
  });

  it("électricité produit des lignes", () => {
    const draft = draftFromSystemTemplate(getSystemTemplate("electrical")!, {});
    assert.equal(draft.lines.length, 3);
  });

  it("terrassement produit des lignes", () => {
    const draft = draftFromSystemTemplate(getSystemTemplate("earthworks")!, {
      chantierId: "ch1",
      chantierName: "Villa",
    });
    assert.equal(draft.lines.length, 2);
    assert.equal(draft.chantier?.id, "ch1");
  });

  it("double clé d’idempotence différente pour deux clics", () => {
    const tpl = getSystemTemplate("plumbing")!;
    const a = draftFromSystemTemplate(tpl, { idempotencyKey: "a" });
    const b = draftFromSystemTemplate(tpl, { idempotencyKey: "b" });
    assert.notEqual(a.idempotencyKey, b.idempotencyKey);
  });
});

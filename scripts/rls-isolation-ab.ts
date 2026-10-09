/**
 * Isolation USER A/B contre un projet Supabase (staging / local).
 *
 * Requis :
 *   RLS_TEST_URL
 *   RLS_TEST_ANON_KEY
 *   RLS_TEST_USER_A_JWT
 *   RLS_TEST_USER_B_JWT
 * Optionnel :
 *   RLS_TEST_DOC_A_ID  — id d’un document appartenant à A
 *   RLS_TEST_DOC_B_ID  — id d’un document appartenant à B
 *
 * Sans ces variables : exit 0 + SKIP (ne fait pas échouer la CI locale).
 * Ne jamais pointer vers la production pour des expériences.
 *
 * Usage : npm run test:isolation:live
 */

import { createClient } from "@supabase/supabase-js";

function requireEnv(name: string): string | null {
  const v = process.env[name]?.trim();
  return v || null;
}

async function main() {
  const url = requireEnv("RLS_TEST_URL");
  const anon = requireEnv("RLS_TEST_ANON_KEY");
  const jwtA = requireEnv("RLS_TEST_USER_A_JWT");
  const jwtB = requireEnv("RLS_TEST_USER_B_JWT");

  if (!url || !anon || !jwtA || !jwtB) {
    console.log(
      "[rls-isolation-ab] SKIP — définir RLS_TEST_URL, RLS_TEST_ANON_KEY, RLS_TEST_USER_A_JWT, RLS_TEST_USER_B_JWT (staging uniquement).",
    );
    process.exit(0);
  }

  if (/qnsalgbohdqetbporlcd|app\.tarineo\.com/.test(url) && process.env.RLS_TEST_ALLOW_PROD !== "true") {
    console.error("[rls-isolation-ab] REFUS — URL ressemble à la prod. Utilisez un projet staging/local.");
    process.exit(2);
  }

  const clientA = createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${jwtA}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const clientB = createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${jwtB}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const docA = requireEnv("RLS_TEST_DOC_A_ID");
  const docB = requireEnv("RLS_TEST_DOC_B_ID");

  const { data: listA, error: errA } = await clientA.from("documents").select("id, user_id");
  const { data: listB, error: errB } = await clientB.from("documents").select("id, user_id");
  if (errA || errB) {
    console.error("[rls-isolation-ab] FAIL lecture listes", errA?.message ?? errB?.message);
    process.exit(1);
  }

  const idsA = new Set((listA ?? []).map((r) => r.id as string));
  const idsB = new Set((listB ?? []).map((r) => r.id as string));
  const overlap = [...idsA].filter((id) => idsB.has(id));
  if (overlap.length) {
    console.error("[rls-isolation-ab] FAIL fuite d’ids croisés", overlap.slice(0, 5));
    process.exit(1);
  }

  if (docA) {
    const { data: steal } = await clientB.from("documents").select("id").eq("id", docA).maybeSingle();
    if (steal) {
      console.error("[rls-isolation-ab] FAIL B a lu le document A", docA);
      process.exit(1);
    }
    const { error: updErr } = await clientB.from("documents").update({ title: "hack" }).eq("id", docA);
    // RLS doit bloquer : 0 rows / erreur policy
    if (!updErr) {
      const { data: after } = await clientA.from("documents").select("title").eq("id", docA).maybeSingle();
      if (after?.title === "hack") {
        console.error("[rls-isolation-ab] FAIL B a modifié le document A");
        process.exit(1);
      }
    }
  }

  if (docB) {
    const { data: steal } = await clientA.from("documents").select("id").eq("id", docB).maybeSingle();
    if (steal) {
      console.error("[rls-isolation-ab] FAIL A a lu le document B", docB);
      process.exit(1);
    }
  }

  // Chantiers
  const { data: chA } = await clientA.from("chantiers").select("id");
  const { data: chB } = await clientB.from("chantiers").select("id");
  const chOverlap = [...new Set((chA ?? []).map((c) => c.id as string))].filter((id) =>
    (chB ?? []).some((c) => c.id === id),
  );
  if (chOverlap.length) {
    console.error("[rls-isolation-ab] FAIL chantiers croisés", chOverlap.slice(0, 5));
    process.exit(1);
  }

  console.log(
    `[rls-isolation-ab] PASS — A=${idsA.size} docs, B=${idsB.size} docs, overlap=0` +
      (docA ? ", B↛docA" : "") +
      (docB ? ", A↛docB" : ""),
  );
}

main().catch((e) => {
  console.error("[rls-isolation-ab] ERROR", e instanceof Error ? e.message : e);
  process.exit(1);
});

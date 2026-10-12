import { NextResponse } from "next/server";

import { validateArtisanContact } from "@/lib/site/artisan-contact-validation";
import { checkArtisanContactRateLimit } from "@/lib/site/artisan-contact-rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";

type Body = {
  prenom?: unknown;
  metier?: unknown;
  telephone?: unknown;
  email?: unknown;
  website?: unknown;
};

export async function POST(request: Request) {
  if (!checkArtisanContactRateLimit(request.headers)) {
    return NextResponse.json(
      { ok: false, message: "Trop de tentatives. Réessayez dans une heure." },
      { status: 429 },
    );
  }

  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Requête invalide." }, { status: 400 });
  }

  if (typeof body.website === "string" && body.website.trim()) {
    return NextResponse.json({ ok: true });
  }

  const validated = validateArtisanContact({
    prenom: typeof body.prenom === "string" ? body.prenom : "",
    metier: typeof body.metier === "string" ? body.metier : "",
    telephone: typeof body.telephone === "string" ? body.telephone : "",
    email: typeof body.email === "string" ? body.email : "",
  });

  if (!validated.ok) {
    return NextResponse.json({ ok: false, message: validated.message }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("demandes_artisans").insert({
      prenom: validated.data.prenom,
      metier: validated.data.metier,
      telephone: validated.data.telephone,
      email: validated.data.email,
    });

    if (error) {
      console.error("[demandes-artisans]", error.message);
      return NextResponse.json(
        {
          ok: false,
          message:
            "Enregistrement impossible pour le moment. Réessayez ou écrivez-nous à contact@tarineo.com.",
        },
        { status: 500 },
      );
    }
  } catch (e) {
    console.error("[demandes-artisans]", e);
    return NextResponse.json(
      {
        ok: false,
        message: "Service indisponible. Vérifiez la configuration serveur (Supabase).",
      },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true });
}

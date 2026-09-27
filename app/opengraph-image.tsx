import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand";

export const alt = `${BRAND.name} — ${BRAND.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logo = await readFile(join(process.cwd(), "public/brand/tarineo-mark.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "radial-gradient(ellipse 60% 55% at 85% 100%, rgba(236,88,33,0.28) 0%, #050505 70%)",
          backgroundColor: "#050505",
          color: "#ffffff",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <img src={logoSrc} width={64} height={64} alt="" />
          <div style={{ fontSize: 40, fontWeight: 600, letterSpacing: "-0.03em" }}>{BRAND.name}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 70, fontWeight: 600, letterSpacing: "-0.045em", lineHeight: 1.02, maxWidth: 980 }}>
            Vos devis fournisseurs, comparés à votre historique.
          </div>
          <div style={{ display: "flex", fontSize: 28, marginTop: 28, color: "#a0a0a0" }}>
            {BRAND.tagline}
            <span style={{ color: "#ec5821", marginLeft: 16 }}>+14,5 %</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}

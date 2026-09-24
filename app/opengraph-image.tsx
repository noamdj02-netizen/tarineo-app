import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand";

export const alt = `${BRAND.name} — cockpit des fondateurs solo`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 72,
          background: "linear-gradient(145deg, #f3f3f2 0%, #ebe4ff 45%, #dce8ff 100%)",
          color: "#111111",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.65 }}>
          Cockpit fondateur
        </div>
        <div style={{ fontSize: 72, fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.02, marginTop: 16 }}>
          {BRAND.name}
        </div>
        <div style={{ fontSize: 32, lineHeight: 1.35, maxWidth: 720, marginTop: 24, opacity: 0.78 }}>
          Un seul projet en Focus. Copilote IA, planning et ressources design au même endroit.
        </div>
      </div>
    ),
    { ...size },
  );
}

// Génère les icônes de l'app (écran d'accueil iPhone, Android, favicon PWA) dans public/icons.
// Usage : npm run icons
import { mkdir, writeFile } from "node:fs/promises";
import { createElement as h } from "react";
import { ImageResponse } from "next/og.js";

const FONT_BASE = "https://github.com/google/fonts/raw/main/ofl/instrumentserif/";
const [regular, italic] = await Promise.all(
  ["InstrumentSerif-Regular.ttf", "InstrumentSerif-Italic.ttf"].map(async (f) => {
    const res = await fetch(FONT_BASE + f);
    if (!res.ok) throw new Error(`Police introuvable : ${f}`);
    return res.arrayBuffer();
  }),
);

// Couleurs Mono Lead (globals.css) : fond --color-side, lettre --color-side-ink, point --color-accent-2
const INK = "#111111";

/** « N. » du logo, centré. `scale` = part de l'icône occupée (zone sûre des icônes maskable). */
function icon(size, scale) {
  const fontSize = Math.round(size * 0.62 * scale);
  return new ImageResponse(
    h(
      "div",
      {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: INK,
          color: "#ffffff",
          fontFamily: "Instrument Serif",
          fontSize,
          letterSpacing: "-0.02em",
          paddingBottom: Math.round(fontSize * 0.08),
        },
      },
      "N",
      h("span", { style: { color: "#9a9a9a", fontStyle: "italic" } }, "."),
    ),
    {
      width: size,
      height: size,
      fonts: [
        { name: "Instrument Serif", data: regular, style: "normal", weight: 400 },
        { name: "Instrument Serif", data: italic, style: "italic", weight: 400 },
      ],
    },
  );
}

const OUT = new URL("../public/icons/", import.meta.url);
await mkdir(OUT, { recursive: true });

const files = [
  ["icon-192.png", 192, 1],
  ["icon-512.png", 512, 1],
  ["maskable-512.png", 512, 0.7],
  ["apple-touch-icon.png", 180, 0.9],
];
for (const [name, size, scale] of files) {
  const png = Buffer.from(await icon(size, scale).arrayBuffer());
  await writeFile(new URL(name, OUT), png);
  console.log(`public/icons/${name} (${size}×${size})`);
}

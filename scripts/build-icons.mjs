// Génère les icônes PWA + logoNavPit.png à partir de public/icons/logoNavPit-source.jpg
// Usage : npm run icons
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const BG = { r: 243, g: 243, b: 242, alpha: 1 }; // --color-bg

const OUT = fileURLToPath(new URL("../public/icons/", import.meta.url));
const SRC = fileURLToPath(new URL("../public/icons/logoNavPit-source.jpg", import.meta.url));

/** Mascotte centrée sur fond Mono Lead ; `inset` = marge (ratio) pour zone sûre maskable. */
async function renderIcon(size, inset = 0.08) {
  const margin = Math.round(size * inset);
  const inner = size - margin * 2;
  const mascot = await sharp(SRC)
    .resize(inner, inner, { fit: "contain", background: BG })
    .png()
    .toBuffer();

  return sharp({
    create: { width: size, height: size, channels: 4, background: BG },
  })
    .composite([{ input: mascot, gravity: "centre" }])
    .png()
    .toBuffer();
}

await mkdir(OUT, { recursive: true });

const files = [
  ["icon-192.png", 192, 0.08],
  ["icon-512.png", 512, 0.08],
  ["maskable-512.png", 512, 0.18],
  ["apple-touch-icon.png", 180, 0.1],
  ["logoNavPit.png", 512, 0.08],
];

for (const [name, size, inset] of files) {
  const png = await renderIcon(size, inset);
  await writeFile(`${OUT}/${name}`, png);
  console.log(`public/icons/${name} (${size}×${size})`);
}

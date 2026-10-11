// Génère les icônes PWA (clair + sombre) depuis les sources brand.
// Usage : npm run icons
import { copyFile, mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const FAVICON = `${ROOT}public/brand/favicon/`;
const ICONS = `${ROOT}public/icons/`;
const LIGHT = `${FAVICON}tarineo-icon-light-source.png`;
const DARK = `${FAVICON}tarineo-icon-dark-source.png`;

async function square(src, size, out, inset = 0) {
  const margin = Math.round(size * inset);
  const inner = size - margin * 2;
  const img = await sharp(src)
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const buf = await sharp({
    create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: img, gravity: "centre" }])
    .png()
    .toBuffer();

  await writeFile(out, buf);
  console.log(out.replace(ROOT, ""), `(${size}×${size})`);
}

await mkdir(FAVICON, { recursive: true });
await mkdir(ICONS, { recursive: true });

await square(LIGHT, 192, `${FAVICON}icon-192.png`);
await square(LIGHT, 512, `${FAVICON}icon-512.png`);
await square(LIGHT, 180, `${FAVICON}apple-touch-icon.png`);
await square(LIGHT, 32, `${FAVICON}icon-32.png`);
await square(LIGHT, 32, `${FAVICON}favicon-32.png`);

await square(DARK, 192, `${FAVICON}icon-192-dark.png`);
await square(DARK, 512, `${FAVICON}icon-512-dark.png`);
await square(DARK, 180, `${FAVICON}apple-touch-icon-dark.png`);
await square(DARK, 512, `${FAVICON}maskable-512.png`, 0.1);

for (const name of [
  "icon-192.png",
  "icon-512.png",
  "maskable-512.png",
  "apple-touch-icon.png",
]) {
  await copyFile(`${FAVICON}${name}`, `${ICONS}${name}`);
  console.log(`public/icons/${name} (mirror)`);
}

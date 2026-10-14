import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function fieldKeyframes(fields, prefix) {
  const match = fields.find((f) => f.field.startsWith(prefix));
  return match?.keyframes ?? [];
}

function sampleStep(keyframes, timeMs) {
  if (keyframes.length === 0) return 0;
  let value = keyframes[0].value;
  for (const kf of keyframes) {
    if (kf.timeMs > timeMs) break;
    value = kf.value;
  }
  return value;
}

function buildFigmaPathTrimTrack(node) {
  const opacityKf = fieldKeyframes(node.fields, "opacity");
  const trimStartKf = fieldKeyframes(node.fields, "pathTrimStart");
  const trimEndKf = fieldKeyframes(node.fields, "pathTrimEnd");

  const timeSet = new Set();
  for (const kf of [...opacityKf, ...trimStartKf, ...trimEndKf]) {
    timeSet.add(kf.timeMs);
  }
  const sortedMs = [...timeSet].sort((a, b) => a - b);

  const times = sortedMs.map((t) => t / node.timelineDurationMs);
  const opacity = sortedMs.map((t) => sampleStep(opacityKf, t) / 100);
  const strokeDasharray = [];
  const strokeDashoffset = [];

  for (const t of sortedMs) {
    const trimStart = sampleStep(trimStartKf, t);
    const trimEnd = sampleStep(trimEndKf, t);
    const len = Math.max(0, trimEnd - trimStart);
    strokeDasharray.push(`${len} 1`);
    strokeDashoffset.push(-trimStart);
  }

  return {
    duration: node.timelineDurationMs / 1000,
    times,
    opacity,
    strokeDasharray,
    strokeDashoffset,
  };
}

const payload = JSON.parse(
  readFileSync(join(root, "components/site/landing-v2/lib/hero-figma-circuit-motion.payload.json"), "utf8"),
);

const tracks = {};
for (const node of payload.nodes) {
  if (!node.fields.some((f) => f.field.includes("pathTrim"))) continue;
  tracks[node.node] = buildFigmaPathTrimTrack(node);
}

const out = `/** Généré par \`node scripts/generate-hero-figma-circuit-tracks.mjs\` — ne pas éditer à la main. */
import type { FigmaPathTrimTrack } from "@/components/site/landing-v2/lib/figma-path-trim-motion";

export const HERO_FIGMA_CIRCUIT_DURATION_S = ${payload.nodes[0]?.timelineDurationMs ?? 8876.95} / 1000;

export const HERO_FIGMA_CIRCUIT_TRACKS: Record<string, FigmaPathTrimTrack> = ${JSON.stringify(tracks, null, 2)};
`;

writeFileSync(join(root, "components/site/landing-v2/lib/hero-figma-circuit-tracks.generated.ts"), out);
console.log("Wrote", Object.keys(tracks).length, "tracks");

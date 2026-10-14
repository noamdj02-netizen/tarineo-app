import payload from "@/components/site/landing-v2/lib/hero-figma-circuit-motion.payload.json";
import {
  buildFigmaPathTrimTrack,
  type FigmaMotionNode,
  type FigmaPathTrimTrack,
} from "@/components/site/landing-v2/lib/figma-path-trim-motion";

const motionNodes = payload.nodes as FigmaMotionNode[];

export const HERO_FIGMA_CIRCUIT_DURATION_S = 8876.95 / 1000;

const tracks: Record<string, FigmaPathTrimTrack> = {};

for (const node of motionNodes) {
  if (!node.fields.some((f) => f.field.includes("pathTrim"))) continue;
  tracks[node.node] = buildFigmaPathTrimTrack(node);
}

export const HERO_FIGMA_CIRCUIT_TRACKS = tracks;

export function getHeroFigmaCircuitTrack(figmaNodeId: string): FigmaPathTrimTrack | undefined {
  return HERO_FIGMA_CIRCUIT_TRACKS[figmaNodeId];
}

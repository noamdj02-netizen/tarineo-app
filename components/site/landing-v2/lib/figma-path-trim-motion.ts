/** Convertit les keyframes Figma (path trim + opacity) en pistes Framer Motion. */

export type FigmaMotionKeyframe = {
  timeMs: number;
  value: number;
};

export type FigmaMotionField = {
  field: string;
  keyframes: FigmaMotionKeyframe[];
};

export type FigmaMotionNode = {
  node: string;
  timelineDurationMs: number;
  fields: FigmaMotionField[];
};

export type FigmaPathTrimTrack = {
  duration: number;
  times: number[];
  opacity: number[];
  strokeDasharray: string[];
  strokeDashoffset: number[];
};

function fieldKeyframes(fields: FigmaMotionField[], prefix: string): FigmaMotionKeyframe[] {
  const match = fields.find((f) => f.field.startsWith(prefix));
  return match?.keyframes ?? [];
}

function sampleStep(keyframes: FigmaMotionKeyframe[], timeMs: number): number {
  if (keyframes.length === 0) return 0;
  let value = keyframes[0].value;
  for (const kf of keyframes) {
    if (kf.timeMs > timeMs) break;
    value = kf.value;
  }
  return value;
}

/** Interpolation « hold » entre keyframes Figma (path trim / opacity). */
export function buildFigmaPathTrimTrack(node: FigmaMotionNode): FigmaPathTrimTrack {
  const opacityKf = fieldKeyframes(node.fields, "opacity");
  const trimStartKf = fieldKeyframes(node.fields, "pathTrimStart");
  const trimEndKf = fieldKeyframes(node.fields, "pathTrimEnd");

  const timeSet = new Set<number>();
  for (const kf of [...opacityKf, ...trimStartKf, ...trimEndKf]) {
    timeSet.add(kf.timeMs);
  }
  const sortedMs = [...timeSet].sort((a, b) => a - b);
  const duration = node.timelineDurationMs / 1000;

  const times = sortedMs.map((t) => t / node.timelineDurationMs);
  const opacity = sortedMs.map((t) => sampleStep(opacityKf, t) / 100);

  const strokeDasharray: string[] = [];
  const strokeDashoffset: number[] = [];

  for (const t of sortedMs) {
    const trimStart = sampleStep(trimStartKf, t);
    const trimEnd = sampleStep(trimEndKf, t);
    const len = Math.max(0, trimEnd - trimStart);
    strokeDasharray.push(`${len} 1`);
    strokeDashoffset.push(-trimStart);
  }

  return { duration, times, opacity, strokeDasharray, strokeDashoffset };
}

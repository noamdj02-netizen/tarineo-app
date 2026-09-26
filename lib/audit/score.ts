import type { FrameState } from "@/lib/design-data/audit";
import { FRAMES } from "@/lib/design-data/frames";

export type { FrameState };

export const EMPTY_FRAMES: FrameState[] = Array.from({ length: 12 }, () => "unk");

const CYCLE: FrameState[] = ["unk", "bad", "warn", "ok"];

export function isFrameState(v: unknown): v is FrameState {
  return v === "ok" || v === "warn" || v === "bad" || v === "unk";
}

export function normalizeFrames(raw: unknown): FrameState[] {
  const arr = Array.isArray(raw) ? raw : [];
  return EMPTY_FRAMES.map((_, i) => (isFrameState(arr[i]) ? arr[i] : "unk"));
}

export function cycleFrame(state: FrameState): FrameState {
  return CYCLE[(CYCLE.indexOf(state) + 1) % CYCLE.length];
}

export function scoreOf(frames: FrameState[]) {
  return frames.filter((s) => s === "ok").length;
}

const RANK: Record<FrameState, number> = { bad: 0, warn: 1, unk: 2, ok: 3 };

export type FrameTip = {
  index: number;
  name: string;
  state: FrameState;
  role: string;
  rule: string;
  err: string;
  ex: string;
};

export function nextTip(frames: FrameState[]): FrameTip | null {
  let best: FrameTip | null = null;
  FRAMES.forEach((f, i) => {
    const state = frames[i] ?? "unk";
    if (state === "ok") return;
    const tip: FrameTip = {
      index: i,
      name: f.n,
      state,
      role: f.role,
      rule: f.rule,
      err: f.err,
      ex: f.ex,
    };
    if (!best || RANK[state] < RANK[best.state] || (RANK[state] === RANK[best.state] && i < best.index)) {
      best = tip;
    }
  });
  return best;
}

export function frameTip(index: number, state: FrameState): FrameTip {
  const f = FRAMES[index];
  return {
    index,
    name: f?.n ?? "Frame",
    state,
    role: f?.role ?? "",
    rule: f?.rule ?? "",
    err: f?.err ?? "",
    ex: f?.ex ?? "",
  };
}

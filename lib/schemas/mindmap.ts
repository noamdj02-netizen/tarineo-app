/** Squelette accepté par convertToExcalidrawElements. */
export type MindSkeleton = {
  id?: string;
  type: "rectangle" | "ellipse" | "arrow" | "line" | "text";
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  strokeColor?: string;
  backgroundColor?: string;
  fillStyle?: "hachure" | "solid" | "cross-hatch";
  strokeWidth?: number;
  roughness?: number;
  roundness?: { type: 3 } | null;
  angle?: number;
  fontSize?: number;
  fontFamily?: number;
  points?: [number, number][];
  startArrowhead?: "arrow" | null;
  endArrowhead?: "arrow" | null;
  start?: { id: string };
  end?: { id: string };
  label?: {
    text: string;
    fontSize?: number;
    fontFamily?: number;
    textAlign?: "left" | "center";
    verticalAlign?: "top" | "middle";
    strokeColor?: string;
  };
};

export type MindNode = {
  id: string;
  label: string;
  kids: MindNode[];
};

const VIRGIL = 1;
const GAP_X = 150;
const GAP_Y = 22;

const BRANCH = [
  { stroke: "#1971c2", fill: "#a5d8ff" },
  { stroke: "#2f9e44", fill: "#b2f2bb" },
  { stroke: "#e8590c", fill: "#ffd8a8" },
  { stroke: "#9c36b5", fill: "#eebefa" },
  { stroke: "#c92a2a", fill: "#ffc9c9" },
  { stroke: "#0c8599", fill: "#99e9f2" },
] as const;

function cleanLabel(raw: string) {
  return raw
    .replace(/^root\s*/i, "")
    .replace(/^\(\(([\s\S]*)\)\)$/, "$1")
    .replace(/^\)([\s\S]*)\($/, "$1")
    .replace(/^\{\{([\s\S]*)\}\}$/, "$1")
    .replace(/^\[\[([\s\S]*)\]\]$/, "$1")
    .replace(/^\[([\s\S]*)\]$/, "$1")
    .replace(/^"([\s\S]*)"$/, "$1")
    .replace(/^'([\s\S]*)'$/, "$1")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 42);
}

export function parseMindmap(src: string): MindNode | null {
  const lines = src.replace(/\r/g, "").replace(/\t/g, "  ").split("\n");
  const start = lines.findIndex((l) => /^\s*mindmap\b/i.test(l));
  if (start < 0) return null;
  const rows = lines
    .slice(start + 1)
    .filter((l) => l.trim() && !l.trim().startsWith("%%"))
    .map((l) => ({
      indent: l.match(/^ */)?.[0].length ?? 0,
      label: cleanLabel(l.trim()),
    }))
    .filter((r) => r.label);
  if (!rows.length) return null;

  const root: MindNode = { id: "n0", label: rows[0]!.label, kids: [] };
  const stack: { indent: number; node: MindNode }[] = [{ indent: rows[0]!.indent, node: root }];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]!;
    while (stack.length > 1 && row.indent <= stack[stack.length - 1]!.indent) stack.pop();
    const parent = stack[stack.length - 1]!.node;
    const node: MindNode = { id: `n${i}`, label: row.label, kids: [] };
    parent.kids.push(node);
    stack.push({ indent: row.indent, node });
  }
  return root;
}

function sizeOf(label: string, depth: number) {
  const w = Math.min(depth === 0 ? 280 : 240, Math.max(depth === 0 ? 168 : 132, label.length * 10 + 32));
  const h = depth === 0 ? 62 : 46;
  return { w, h };
}

function subtreeH(node: MindNode, depth: number): number {
  const { h } = sizeOf(node.label, depth);
  if (!node.kids.length) return h;
  const kids = node.kids.reduce((sum, k) => sum + subtreeH(k, depth + 1), 0);
  return Math.max(h, kids + GAP_Y * (node.kids.length - 1));
}

type Placed = { id: string; label: string; x: number; y: number; w: number; h: number; depth: number; color: number };

function place(
  node: MindNode,
  cx: number,
  cy: number,
  side: -1 | 1,
  depth: number,
  color: number,
  out: Placed[],
) {
  const { w, h } = sizeOf(node.label, depth);
  const x = side < 0 ? cx - w : cx;
  out.push({ id: node.id, label: node.label, x, y: cy - h / 2, w, h, depth, color });
  if (!node.kids.length) return;
  let cursor = cy - subtreeH(node, depth) / 2;
  node.kids.forEach((kid, i) => {
    const kh = subtreeH(kid, depth + 1);
    const nextCx = side < 0 ? x - GAP_X : x + w + GAP_X;
    place(kid, nextCx, cursor + kh / 2, side, depth + 1, color, out);
    cursor += kh + (i < node.kids.length - 1 ? GAP_Y : 0);
  });
}

function nodeSkeleton(p: Placed): MindSkeleton {
  const pal = BRANCH[p.color % BRANCH.length]!;
  const root = p.depth === 0;
  return {
    id: p.id,
    type: root ? "ellipse" : "rectangle",
    x: p.x,
    y: p.y,
    width: p.w,
    height: p.h,
    strokeColor: root ? "#1e1e1e" : pal.stroke,
    backgroundColor: root ? "#fff3bf" : pal.fill,
    fillStyle: root ? "solid" : "hachure",
    strokeWidth: root ? 2.5 : 2,
    roughness: 1.35,
    ...(root ? {} : { roundness: { type: 3 as const } }),
    label: {
      text: p.label,
      fontSize: root ? 22 : 16,
      fontFamily: VIRGIL,
      textAlign: "center",
      verticalAlign: "middle",
      strokeColor: "#1e1e1e",
    },
  };
}

function sticky(text: string, x: number, y: number, i: number): MindSkeleton {
  return {
    id: `sticky-${i}`,
    type: "rectangle",
    x,
    y,
    width: 200,
    height: 132,
    strokeColor: "#f08c00",
    backgroundColor: "#fff3bf",
    fillStyle: "solid",
    strokeWidth: 1.5,
    roughness: 1.6,
    roundness: { type: 3 },
    angle: (i % 2 === 0 ? -1 : 1) * 0.04,
    label: {
      text: text.slice(0, 90),
      fontSize: 16,
      fontFamily: VIRGIL,
      textAlign: "left",
      verticalAlign: "top",
      strokeColor: "#1e1e1e",
    },
  };
}

export function mindmapSkeletons(
  src: string,
  opts?: { title?: string; stickies?: string[] },
): MindSkeleton[] {
  const tree = parseMindmap(src);
  if (!tree) return [];

  const left = tree.kids.filter((_, i) => i % 2 === 1);
  const right = tree.kids.filter((_, i) => i % 2 === 0);
  const placed: Placed[] = [];
  const rootSize = sizeOf(tree.label, 0);
  placed.push({
    id: tree.id,
    label: tree.label,
    x: -rootSize.w / 2,
    y: -rootSize.h / 2,
    w: rootSize.w,
    h: rootSize.h,
    depth: 0,
    color: 0,
  });

  const layoutSide = (kids: MindNode[], side: -1 | 1) => {
    if (!kids.length) return;
    const total = kids.reduce((s, k) => s + subtreeH(k, 1), 0) + GAP_Y * (kids.length - 1);
    let cursor = -total / 2;
    kids.forEach((kid, i) => {
      const h = subtreeH(kid, 1);
      const cx = side < 0 ? -rootSize.w / 2 - GAP_X : rootSize.w / 2 + GAP_X;
      place(kid, cx, cursor + h / 2, side, 1, i, placed);
      cursor += h + GAP_Y;
    });
  };
  layoutSide(left, -1);
  layoutSide(right, 1);

  const byId = new Map(placed.map((p) => [p.id, p]));
  const edges: { from: string; to: string; color: number }[] = [];
  const walk = (node: MindNode) => {
    for (const kid of node.kids) {
      const color = byId.get(kid.id)?.color ?? 0;
      edges.push({ from: node.id, to: kid.id, color });
      walk(kid);
    }
  };
  walk(tree);

  const out: MindSkeleton[] = [];
  if (opts?.title) {
    out.push({
      type: "text",
      id: "title",
      x: placed.reduce((m, p) => Math.min(m, p.x), 0) - 8,
      y: placed.reduce((m, p) => Math.min(m, p.y), 0) - 72,
      text: opts.title,
      fontSize: 28,
      fontFamily: VIRGIL,
      strokeColor: "#1971c2",
    });
  }

  const xs = placed.map((p) => p.x);
  const x2 = placed.map((p) => p.x + p.w);
  const spineL = Math.min(...xs) + 20;
  const spineR = Math.max(...x2) - 20;
  if (spineR - spineL > 240) {
    out.push({
      type: "line",
      id: "spine",
      x: spineL,
      y: 0,
      points: [
        [0, 0],
        [spineR - spineL, 0],
      ],
      strokeColor: "#74c0fc",
      strokeWidth: 2,
      roughness: 0.9,
    });
  }

  for (const p of placed) out.push(nodeSkeleton(p));
  for (const e of edges) {
    const from = byId.get(e.from);
    const to = byId.get(e.to);
    if (!from || !to) continue;
    out.push({
      type: "arrow",
      id: `e-${e.from}-${e.to}`,
      x: 0,
      y: 0,
      strokeColor: BRANCH[e.color % BRANCH.length]!.stroke,
      strokeWidth: 1.5,
      roughness: 1.2,
      start: { id: from.id },
      end: { id: to.id },
      startArrowhead: null,
      endArrowhead: "arrow",
    });
  }

  const maxX = Math.max(...x2);
  const maxY = Math.max(...placed.map((p) => p.y + p.h));
  (opts?.stickies ?? [])
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 2)
    .forEach((t, i) => {
      out.push(sticky(t, maxX + 48, maxY + 24 + i * 152, i));
    });

  return out;
}

export function isMindmap(src: string) {
  return /^\s*mindmap\b/m.test(src);
}

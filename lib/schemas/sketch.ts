import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";

const VIRGIL = 1;
const PALETTE = [
  { stroke: "#1971c2", fill: "#a5d8ff" },
  { stroke: "#2f9e44", fill: "#b2f2bb" },
  { stroke: "#e8590c", fill: "#ffd8a8" },
  { stroke: "#9c36b5", fill: "#eebefa" },
  { stroke: "#c92a2a", fill: "#ffc9c9" },
  { stroke: "#0c8599", fill: "#99e9f2" },
] as const;

const PAPER = "#fffef8";

export function paperColor() {
  return PAPER;
}

/** Trait à la main + couleurs, comme un tableau Excalidraw. */
export function sketchify<T extends ExcalidrawElement>(elements: readonly T[]): T[] {
  let i = 0;
  return elements.map((el) => {
    if (el.type === "text") {
      return { ...el, fontFamily: VIRGIL, roughness: 0 };
    }
    if (el.type === "arrow" || el.type === "line") {
      return {
        ...el,
        roughness: 1.35,
        strokeWidth: Math.max(1.5, el.strokeWidth),
        strokeColor:
          el.strokeColor === "#1e1e1e" || el.strokeColor === "#000000" || el.strokeColor === "#868e96"
            ? "#495057"
            : el.strokeColor,
      };
    }
    if (el.type === "rectangle" || el.type === "ellipse" || el.type === "diamond") {
      const pal = PALETTE[i++ % PALETTE.length]!;
      return {
        ...el,
        roughness: 1.4,
        fillStyle: "hachure",
        strokeWidth: 2,
        strokeColor: pal.stroke,
        backgroundColor: pal.fill,
        roundness: el.type === "rectangle" ? { type: 3 } : el.roundness,
      };
    }
    return el;
  });
}

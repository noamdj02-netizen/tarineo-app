import { restoreLibraryItems } from "@excalidraw/excalidraw";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import type { LibraryItem, LibraryItems } from "@excalidraw/excalidraw/types";
import {
  EXCALIDRAW_LIB_SOURCES,
  itemMatchesKey,
  libCdnUrl,
  type IconKey,
} from "./excalidraw-libs";

const ICON = 40;

function box(els: readonly { x: number; y: number; width: number; height: number }[]) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const e of els) {
    minX = Math.min(minX, e.x);
    minY = Math.min(minY, e.y);
    maxX = Math.max(maxX, e.x + e.width);
    maxY = Math.max(maxY, e.y + e.height);
  }
  return { minX, minY, w: maxX - minX, h: maxY - minY };
}

function findItem(items: LibraryItems, key: IconKey) {
  return items.find((it) => itemMatchesKey(it.name, key)) ?? null;
}

function cloneAt(
  item: LibraryItem,
  cx: number,
  top: number,
): ExcalidrawElement[] {
  const b = box(item.elements);
  if (!b.w || !b.h) return [];
  const scale = ICON / Math.max(b.w, b.h);
  const gid = crypto.randomUUID();
  const idMap = new Map<string, string>();
  for (const el of item.elements) idMap.set(el.id, crypto.randomUUID());
  return item.elements.map((el) => {
    const id = idMap.get(el.id) ?? crypto.randomUUID();
    return {
      ...el,
      id,
      x: cx - (ICON * b.w) / Math.max(b.w, b.h) / 2 + (el.x - b.minX) * scale,
      y: top + (el.y - b.minY) * scale,
      width: el.width * scale,
      height: el.height * scale,
      groupIds: [gid],
      boundElements: null,
      containerId: null,
      frameId: null,
      version: 1,
      versionNonce: Math.floor(Math.random() * 2 ** 31),
      updated: Date.now(),
      index: null,
    } as ExcalidrawElement;
  });
}

function nodeBox(
  elements: readonly ExcalidrawElement[],
  label: string,
): { cx: number; top: number } | null {
  const want = label.replace(/\s+/g, " ").trim().toLowerCase();
  const text = elements.find(
    (el) =>
      el.type === "text" &&
      "text" in el &&
      String((el as { text?: string }).text ?? "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase()
        .includes(want),
  );
  if (!text) return null;
  const gid = text.groupIds[0];
  const pack = gid ? elements.filter((el) => el.groupIds.includes(gid)) : [text];
  const b = box(pack);
  return { cx: b.minX + b.w / 2, top: b.minY - ICON - 8 };
}

export async function loadNavpitLibraries(): Promise<LibraryItems> {
  const packs = await Promise.all(
    EXCALIDRAW_LIB_SOURCES.map(async (source) => {
      const res = await fetch(libCdnUrl(source));
      if (!res.ok) return [];
      const json = (await res.json()) as {
        libraryItems?: unknown;
        library?: unknown;
      };
      const raw = json.libraryItems ?? json.library;
      if (!Array.isArray(raw)) return [];
      return restoreLibraryItems(raw as LibraryItems, "published");
    }),
  );
  const seen = new Set<string>();
  const out: LibraryItem[] = [];
  for (const item of packs.flat()) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    out.push(item);
  }
  return out;
}

export function stampIcons<T extends ExcalidrawElement>(
  elements: readonly T[],
  mapping: Record<string, IconKey>,
  nodes: { id: string; label: string }[],
  items: LibraryItems,
): T[] {
  const extra: ExcalidrawElement[] = [];
  for (const node of nodes) {
    const key = mapping[node.id];
    if (!key) continue;
    const item = findItem(items, key);
    if (!item) continue;
    const pos = nodeBox(elements, node.label);
    if (!pos) continue;
    extra.push(...cloneAt(item, pos.cx, pos.top));
  }
  return [...elements, ...extra] as T[];
}

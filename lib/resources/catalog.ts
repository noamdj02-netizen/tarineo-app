import { CURATED_RESOURCES, type CuratedResource } from "@/lib/design-data/resources";
import { CODE_LIBS, REF_LIBS } from "@/lib/kit/library-sources";
import type { Resource } from "./types";

function slug(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function resourceKey(url: string, name: string) {
  try {
    const u = new URL(url);
    return `${u.hostname.replace(/^www\./, "")}${u.pathname.replace(/\/$/, "")}`;
  } catch {
    return slug(name);
  }
}

function fromCurated(r: CuratedResource): Resource {
  return {
    id: `curated:${slug(r.name)}`,
    name: r.name,
    url: r.url,
    category: r.cat,
    tags: r.tags,
    note: r.note,
    source: "curated",
    verified: false,
    notion_url: "",
  };
}

/** Catalogue figé : toujours visible, même sans seed Supabase. */
export function catalogResources(): Resource[] {
  const seen = new Set<string>();
  const out: Resource[] = [];
  for (const r of CURATED_RESOURCES) {
    const key = resourceKey(r.url, r.name);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(fromCurated(r));
  }
  const codeUrls = new Set(CODE_LIBS.map((s) => s.url));
  for (const lib of [...CODE_LIBS, ...REF_LIBS]) {
    const key = resourceKey(lib.url, lib.name);
    if (seen.has(key)) continue;
    seen.add(key);
    const copy = codeUrls.has(lib.url);
    out.push({
      id: `curated:${slug(lib.name)}`,
      name: lib.name,
      url: lib.url,
      category: copy ? "Composants UI" : "Inspiration",
      tags: copy ? ["React"] : ["UI"],
      note: lib.note,
      source: "curated",
      verified: false,
      notion_url: "",
    });
  }
  return out;
}

export function mergeResourceLists(user: Resource[], catalog: Resource[]): Resource[] {
  const seen = new Set(user.map((r) => resourceKey(r.url, r.name)));
  return [...user, ...catalog.filter((r) => !seen.has(resourceKey(r.url, r.name)))];
}

export const COPY_FIRST_URLS = new Set(CODE_LIBS.map((s) => s.url.replace(/\/$/, "")));

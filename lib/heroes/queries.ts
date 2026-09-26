import "server-only";
import { getDb } from "@/lib/db";
import { HEROES, getHero } from "./catalog";
import type { HeroCard } from "./types";

export async function listHeroes(): Promise<HeroCard[]> {
  const extras = await loadExtras();
  return HEROES.map((h) => ({ ...h, ...extras[h.slug] }));
}

export async function getHeroWithMedia(slug: string): Promise<HeroCard | null> {
  const hero = getHero(slug);
  if (!hero) return null;
  const extras = await loadExtras();
  return { ...hero, ...extras[slug] };
}

async function loadExtras(): Promise<
  Record<string, Pick<HeroCard, "apercuVideoUrl" | "apercuPosterUrl">>
> {
  const db = await getDb();
  if (!db) return {};
  const { data, error } = await db.supabase
    .from("hero_library")
    .select("slug, apercu_video_url, apercu_poster_url");
  if (error || !data) return {};
  return Object.fromEntries(
    data.map((row) => [
      row.slug,
      { apercuVideoUrl: row.apercu_video_url, apercuPosterUrl: row.apercu_poster_url },
    ]),
  );
}

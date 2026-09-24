"use client";

import { Plus, StickyNote, Trash2, X } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import type { PostIt, PostItColor } from "@/lib/home/dashboard-prefs";
import { cn } from "@/lib/utils";

const COLORS: Record<PostItColor, string> = {
  peach: "bg-[#fde8d4] text-ink shadow-[2px_3px_0_rgba(247,198,163,0.9)]",
  lavender: "bg-[#ebe4ff] text-ink shadow-[2px_3px_0_rgba(203,189,243,0.85)]",
  blue: "bg-[#dce8ff] text-ink shadow-[2px_3px_0_rgba(179,203,246,0.9)]",
  white: "bg-surface text-ink shadow-soft ring-1 ring-line",
};

const ROTATIONS = ["-rotate-1", "rotate-1", "-rotate-2", "rotate-2", "rotate-0"];

export function PostItBoard({
  postits,
  editMode,
  dense,
  onChange,
}: {
  postits: PostIt[];
  editMode: boolean;
  dense?: boolean;
  onChange: (next: PostIt[]) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const add = useCallback(() => {
    const id = crypto.randomUUID();
    onChange([
      ...postits,
      { id, text: "", color: (["peach", "lavender", "blue", "white"] as PostItColor[])[postits.length % 4] },
    ]);
    setEditingId(id);
  }, [onChange, postits]);

  const update = (id: string, patch: Partial<PostIt>) => {
    onChange(postits.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const remove = (id: string) => {
    onChange(postits.filter((p) => p.id !== id));
    if (editingId === id) setEditingId(null);
  };

  return (
    <section
      className={cn("card-soft flex flex-col gap-2 p-3.5 sm:p-4", dense && "py-3")}
      aria-label="Post-its"
    >
      <header className="flex items-center justify-between gap-2">
        <div>
          <p className="mono-label">{"/ Post-its ///"}</p>
          {!dense ? (
            <p className="mt-1 text-[14px] text-muted-foreground">Notes libres sur ton tableau.</p>
          ) : null}
        </div>
        <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={add}>
          <Plus data-icon="inline-start" aria-hidden />
          Ajouter
        </Button>
      </header>

      {postits.length === 0 ? (
        <button
          type="button"
          onClick={add}
          className="flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line bg-surface-2/80 text-[13px] text-muted-foreground transition-colors hover:border-ink/20 hover:text-ink"
        >
          <StickyNote className="size-6 opacity-60" aria-hidden />
          Premier post-it
        </button>
      ) : (
        <ul
          className={cn(
            dense ? "flex flex-wrap gap-2" : "grid gap-3 sm:grid-cols-2",
          )}
        >
          {postits.map((p, i) => {
            const editing = editingId === p.id;
            return (
              <li
                key={p.id}
                className={cn(
                  "relative rounded-lg p-3 transition-transform duration-300",
                  dense ? "min-h-[80px] min-w-[140px] max-w-[220px] flex-1" : "min-h-[108px] p-3.5",
                  COLORS[p.color],
                  ROTATIONS[i % ROTATIONS.length],
                  editMode && "ring-2 ring-ink/15 ring-offset-2 ring-offset-bg",
                )}
              >
                {editMode ? (
                  <div className="absolute top-2 right-2 flex gap-1">
                    <select
                      aria-label="Couleur"
                      value={p.color}
                      onChange={(e) => update(p.id, { color: e.target.value as PostItColor })}
                      className="h-7 rounded-md border border-line/40 bg-surface/80 px-1 text-[11px]"
                    >
                      <option value="peach">Pêche</option>
                      <option value="lavender">Lavande</option>
                      <option value="blue">Bleu</option>
                      <option value="white">Blanc</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => remove(p.id)}
                      aria-label="Supprimer"
                      className="grid size-7 place-items-center rounded-md bg-ink/5 hover:bg-ink/10"
                    >
                      <Trash2 className="size-3.5" aria-hidden />
                    </button>
                  </div>
                ) : null}
                {editing ? (
                  <textarea
                    autoFocus
                    value={p.text}
                    onChange={(e) => update(p.id, { text: e.target.value })}
                    onBlur={() => setEditingId(null)}
                    placeholder="Écris ici…"
                    className="min-h-[72px] w-full resize-none bg-transparent text-[14px] leading-snug outline-none placeholder:text-ink/40"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditingId(p.id)}
                    className="block min-h-[72px] w-full text-left text-[14px] leading-snug whitespace-pre-wrap"
                  >
                    {p.text || <span className="text-ink/45">Clique pour écrire…</span>}
                  </button>
                )}
                {editing ? (
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium opacity-70"
                  >
                    <X className="size-3" aria-hidden />
                    OK
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

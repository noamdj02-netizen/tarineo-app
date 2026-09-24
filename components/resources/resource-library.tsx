"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ExternalLink, Loader2, NotebookText, Plus, Save, Search, Trash2, X } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState, useTransition } from "react";
import { addResource, deleteResource } from "@/app/(app)/ressources/actions";
import { Illustration } from "@/components/illustration";
import { EASE } from "@/components/motion/reveal";
import { RESOURCE_CATEGORIES } from "@/lib/design-data/resources";
import { safeUrl } from "@/lib/projects/types";
import { resourceLogoUrl } from "@/lib/resources/logo";
import { isWarnTag, type Resource } from "@/lib/resources/types";
import { cn } from "@/lib/utils";

const ALL = "Tout";

function normalize(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function ResourceLibrary({ initial }: { initial: Resource[] }) {
  const [items, setItems] = useState(initial);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState(ALL);
  const q = useDeferredValue(query);

  // si la page serveur renvoie une nouvelle liste (après ajout / suppression), on la reprend
  useEffect(() => setItems(initial), [initial]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const r of items) c[r.category] = (c[r.category] ?? 0) + 1;
    return c;
  }, [items]);

  const list = useMemo(() => {
    const n = normalize(q.trim());
    return items.filter(
      (r) =>
        (cat === ALL || r.category === cat) &&
        (!n || normalize([r.name, r.note, r.category, r.tags.join(" ")].join(" ")).includes(n)),
    );
  }, [items, cat, q]);

  const filters = [ALL, ...RESOURCE_CATEGORIES.filter((c) => counts[c])];

  return (
    <div className="flex flex-col gap-4">
      <AddResource onAdded={(r) => setItems((cur) => [r, ...cur])} />

      <label className="relative block">
        <span className="sr-only">Rechercher</span>
        <Search
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted"
          aria-hidden
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher (ex : 3D, dark, pricing)…"
          className="min-h-12 w-full rounded-pill border border-line bg-surface pr-4 pl-10 text-[15px] outline-none placeholder:text-muted focus:border-ink/30 focus:shadow-soft"
        />
      </label>

      <div
        className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="group"
        aria-label="Catégories"
      >
        {filters.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={c === cat}
            onClick={() => setCat(c)}
            className={cn(
              "min-h-10 flex-none rounded-pill border px-3.5 text-[13px] font-semibold whitespace-nowrap transition-colors",
              c === cat
                ? "border-ink bg-ink text-accent-ink"
                : "border-line bg-surface text-ink/80 hover:bg-accent-soft",
            )}
          >
            {c}
            {c === ALL ? null : (
              <span className="ml-1 font-mono text-[11px] opacity-60">{counts[c]}</span>
            )}
          </button>
        ))}
      </div>

      {list.length ? (
        <div className="grid gap-3 sm:grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
          <AnimatePresence initial={false}>
            {list.map((r, i) => (
              <ResourceCard
                key={r.id}
                r={r}
                index={i}
                onDeleted={() => setItems((cur) => cur.filter((x) => x.id !== r.id))}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-8 text-center text-[14px] text-muted">
          <Illustration name="empty-aucun-resultat" className="size-20" />
          Aucune ressource ne correspond.
        </div>
      )}
    </div>
  );
}

function ResourceCard({
  r,
  index,
  onDeleted,
}: {
  r: Resource;
  index: number;
  onDeleted: () => void;
}) {
  const reduce = useReducedMotion();
  const url = safeUrl(r.url);
  const notion = safeUrl(r.notion_url);
  const origin = r.source === "notion" ? " · Notion" : r.source === "moi" ? " · Ajout perso" : "";

  return (
    <motion.article
      layout={!reduce}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.5, ease: EASE, delay: Math.min(index, 12) * 0.03 }}
      className="card-soft flex flex-col gap-2.5 p-4 transition-shadow duration-300 ease-out-soft hover:shadow-lift"
    >
      <div className="flex items-center gap-3">
        <ResourceLogo r={r} />
        <div className="min-w-0">
          <h3 className="truncate text-[15.5px] font-semibold tracking-[-0.01em]">{r.name}</h3>
          <p className="font-mono text-[10.5px] tracking-[0.06em] text-muted uppercase">
            {r.category}
            {origin}
            {r.verified ? " · testé ✓" : ""}
          </p>
        </div>
      </div>
      {r.note ? <p className="text-[13.5px] leading-snug text-muted">{r.note}</p> : null}
      {r.tags.length ? (
        <div className="flex flex-wrap gap-1">
          {r.tags.map((t) => (
            <span
              key={t}
              className={cn(
                "rounded-md border px-1.5 py-px font-mono text-[10.5px]",
                isWarnTag(t)
                  ? "border-ink/40 border-dashed text-ink"
                  : "border-line bg-surface-2 text-muted",
              )}
            >
              {t}
            </span>
          ))}
        </div>
      ) : null}
      <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-2.5 text-[13px] font-medium hover:bg-accent-soft"
          >
            <ExternalLink className="size-3.5" aria-hidden />
            Ouvrir
          </a>
        ) : null}
        {notion ? (
          <a
            href={notion}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-2.5 text-[13px] font-medium hover:bg-accent-soft"
          >
            <NotebookText className="size-3.5" aria-hidden />
            Fiche
          </a>
        ) : null}
        {r.source === "moi" ? <DeleteButton id={r.id} name={r.name} onDeleted={onDeleted} /> : null}
      </div>
    </motion.article>
  );
}

/** Logo de la marque (logo.dev) ; l'initiale sur fond noir si pas de logo. */
function ResourceLogo({ r }: { r: Resource }) {
  const src = resourceLogoUrl(r);
  const [failed, setFailed] = useState(false);
  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- petite image externe, pas besoin de next/image
      <img
        src={src}
        alt=""
        width={40}
        height={40}
        loading="lazy"
        onError={() => setFailed(true)}
        className="size-10 flex-none rounded-xl border border-line bg-surface object-contain"
      />
    );
  }
  return (
    <span className="btn-dark grid size-10 flex-none place-items-center rounded-xl text-[15px] font-bold">
      {(r.name || "?").trim().charAt(0).toUpperCase()}
    </span>
  );
}

function DeleteButton({
  id,
  name,
  onDeleted,
}: {
  id: string;
  name: string;
  onDeleted: () => void;
}) {
  const [armed, setArmed] = useState(false);
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(t);
  }, [armed]);
  return (
    <button
      type="button"
      disabled={pending}
      aria-label={armed ? `Confirmer la suppression de ${name}` : `Supprimer ${name}`}
      onClick={() => {
        if (!armed) return setArmed(true);
        startTransition(async () => {
          const res = await deleteResource(id);
          if (res.ok) onDeleted();
          else setFailed(true);
        });
      }}
      className={cn(
        "ml-auto inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 font-mono text-[11px] transition-colors",
        armed || failed
          ? "bg-destructive text-accent-ink"
          : "text-muted hover:bg-accent-soft hover:text-ink",
      )}
    >
      {pending ? (
        <Loader2 className="size-3.5 animate-spin" aria-hidden />
      ) : (
        <Trash2 className="size-3.5" aria-hidden />
      )}
      {failed ? "Échec" : armed ? "Supprimer ?" : null}
    </button>
  );
}

const field =
  "w-full rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-[14px] text-ink outline-none focus:border-ink/40 focus:bg-surface";
const labelCls =
  "flex flex-col gap-1.5 font-mono text-[10.5px] tracking-[0.1em] text-muted uppercase";

function AddResource({ onAdded }: { onAdded: (r: Resource) => void }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    setError(null);
    startTransition(async () => {
      const res = await addResource({
        name: String(f.get("name") ?? ""),
        url: String(f.get("url") ?? ""),
        category: String(f.get("category") ?? ""),
        tags: String(f.get("tags") ?? ""),
        note: String(f.get("note") ?? ""),
      });
      if (!res.ok) return setError(res.error);
      onAdded(res.resource);
      form.reset();
      setOpen(false);
    });
  }

  return (
    <div className="rounded-card border border-dashed border-ink/15">
      <AnimatePresence initial={false} mode="wait">
        {open ? (
          <motion.form
            key="form"
            onSubmit={onSubmit}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-3 p-4">
              <div className="flex items-center justify-between">
                <p className="mono-label">/ Ajouter une ressource</p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Fermer"
                  className="grid size-9 place-items-center rounded-pill text-muted hover:bg-accent-soft"
                >
                  <X className="size-4" aria-hidden />
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className={labelCls}>
                  Nom
                  <input
                    name="name"
                    required
                    maxLength={120}
                    placeholder="Ex : Aceternity UI"
                    className={field}
                  />
                </label>
                <label className={labelCls}>
                  Lien
                  <input name="url" type="url" placeholder="https://…" className={field} />
                </label>
                <label className={labelCls}>
                  Catégorie
                  <select name="category" className={field} defaultValue={RESOURCE_CATEGORIES[0]}>
                    {RESOURCE_CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
                <label className={labelCls}>
                  Tags (séparés par des virgules)
                  <input name="tags" placeholder="SaaS, Dark" className={field} />
                </label>
              </div>
              <label className={labelCls}>
                À quoi ça sert
                <textarea name="note" rows={2} maxLength={1000} className={field} />
              </label>
              {error ? (
                <p role="alert" className="text-[13px] text-destructive">
                  {error}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={pending}
                className="btn-dark inline-flex min-h-10 w-fit items-center gap-2 rounded-xl px-3.5 text-[13.5px] font-semibold disabled:opacity-60"
              >
                {pending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <Save className="size-4" aria-hidden />
                )}
                Enregistrer
              </button>
            </div>
          </motion.form>
        ) : (
          <motion.button
            key="cta"
            type="button"
            onClick={() => setOpen(true)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-card font-mono text-[11px] font-medium tracking-[0.12em] text-muted uppercase transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <Plus className="size-4" aria-hidden />
            Ajouter une ressource
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

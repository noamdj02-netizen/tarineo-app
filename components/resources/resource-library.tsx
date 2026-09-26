"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ExternalLink, Loader2, NotebookText, Plus, Save, Search, Trash2, X } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState, useTransition } from "react";
import { addResource, deleteResource } from "@/app/(app)/ressources/actions";
import { Illustration } from "@/components/illustration";
import { EASE } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { ShineBorder } from "@/components/ui/shine-border";
import { CATEGORY_COLORS, RESOURCE_CATEGORIES } from "@/lib/design-data/resources";
import { safeUrl } from "@/lib/projects/types";
import { COPY_FIRST_URLS } from "@/lib/resources/catalog";
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

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function isCopyFirst(r: Resource) {
  return COPY_FIRST_URLS.has(r.url.replace(/\/$/, ""));
}

export function ResourceLibrary({ initial }: { initial: Resource[] }) {
  const [items, setItems] = useState(initial);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState(ALL);
  const q = useDeferredValue(query);

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

  const featured = list.filter(isCopyFirst);
  const rest = list.filter((r) => !isCopyFirst(r));
  const filters = [ALL, ...RESOURCE_CATEGORIES.filter((c) => counts[c])];

  return (
    <div className="flex flex-col gap-6">
      <AddResource onAdded={(r) => setItems((cur) => [r, ...cur])} />

      <div className="flex flex-col gap-3">
        <InputGroup className="h-12 rounded-pill bg-surface">
          <InputGroupAddon>
            <Search aria-hidden />
          </InputGroupAddon>
          <InputGroupInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher (ex : 3D, dark, pricing)…"
            aria-label="Rechercher"
          />
        </InputGroup>

        <div className="picker !pb-0" role="group" aria-label="Catégories">
          {filters.map((c) => (
            <button
              key={c}
              type="button"
              className="chip"
              aria-pressed={c === cat}
              onClick={() => setCat(c)}
            >
              {c === ALL ? null : (
                <span className="sw" style={{ background: CATEGORY_COLORS[c] ?? "#111" }} />
              )}
              {c}
              {c === ALL ? (
                <span className="font-mono text-[11px] opacity-55">{items.length}</span>
              ) : (
                <span className="font-mono text-[11px] opacity-55">{counts[c]}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {featured.length ? (
        <div>
          <p className="mb-3 font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
            À copier d’abord
          </p>
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {featured.map((r, i) => (
              <li key={r.id}>
                <ResourceCard
                  r={r}
                  index={i}
                  featured
                  onDeleted={() => setItems((cur) => cur.filter((x) => x.id !== r.id))}
                />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {rest.length ? (
        <div>
          {featured.length ? (
            <p className="mb-3 font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
              Le reste du tiroir
            </p>
          ) : null}
          <ul className="grid gap-4 lg:grid-cols-2">
            {rest.map((r, i) => (
              <li key={r.id}>
                <ResourceCard
                  r={r}
                  index={i + featured.length}
                  onDeleted={() => setItems((cur) => cur.filter((x) => x.id !== r.id))}
                />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {!list.length ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center text-[14px] text-muted-foreground">
          <Illustration name="empty-aucun-resultat" className="size-20" />
          Aucune ressource ne correspond.
        </div>
      ) : null}
    </div>
  );
}

function ResourceCard({
  r,
  index,
  featured = false,
  onDeleted,
}: {
  r: Resource;
  index: number;
  featured?: boolean;
  onDeleted: () => void;
}) {
  const reduce = useReducedMotion();
  const url = safeUrl(r.url);
  const notion = safeUrl(r.notion_url);
  const origin = r.source === "notion" ? "Notion" : r.source === "moi" ? "Ajout perso" : "Catalogue";

  return (
    <motion.article
      layout={!reduce}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.5, ease: EASE, delay: Math.min(index, 12) * 0.03 }}
      className="comp !mb-0"
    >
      <div className="comp-h">
        <div className="min-w-0">
          <h3 className="min-w-0">
            <ResourceLogo r={r} size={28} />
            <span className="truncate">{r.name}</span>
          </h3>
          <p>
            {r.category}
            {r.verified ? " · testé" : ""}
            {` · ${origin}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {url ? (
            <a href={url} target="_blank" rel="noopener noreferrer" className="copy">
              <ExternalLink className="size-3.5" aria-hidden />
              Ouvrir
            </a>
          ) : null}
          {notion ? (
            <a href={notion} target="_blank" rel="noopener noreferrer" className="copy">
              <NotebookText className="size-3.5" aria-hidden />
              Fiche
            </a>
          ) : null}
          {r.source === "moi" ? <DeleteButton id={r.id} name={r.name} onDeleted={onDeleted} /> : null}
        </div>
      </div>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="stage block p-3 no-underline"
        >
          <ResourcePreview r={r} featured={featured} />
        </a>
      ) : (
        <div className="stage p-3">
          <ResourcePreview r={r} featured={featured} />
        </div>
      )}
      {r.tags.length ? (
        <div className="flex flex-wrap gap-1 px-4 pb-3">
          {r.tags.map((t) => (
            <Badge
              key={t}
              variant={isWarnTag(t) ? "outline" : "secondary"}
              className="font-mono text-[10.5px]"
            >
              {t}
            </Badge>
          ))}
        </div>
      ) : null}
    </motion.article>
  );
}

function ResourcePreview({ r, featured }: { r: Resource; featured?: boolean }) {
  const color = CATEGORY_COLORS[r.category] ?? "#111111";
  const host = hostOf(r.url);
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[14px] border border-line bg-surface-2 transition-transform duration-300 ease-out-soft hover:-translate-y-0.5",
        featured ? "min-h-[168px]" : "min-h-[132px]",
      )}
    >
      {featured ? <ShineBorder shineColor={["#111111", color, "#111111"]} duration={18} /> : null}
      <div className="flex h-8 items-center gap-2 border-b border-line bg-surface px-3">
        <span className="flex gap-1" aria-hidden>
          <i className="size-2 rounded-full bg-[#E8B4A0]" />
          <i className="size-2 rounded-full bg-[#E2D48A]" />
          <i className="size-2 rounded-full bg-[#A8C9A0]" />
        </span>
        <span className="truncate font-mono text-[10.5px] tracking-[0.04em] text-muted-foreground">
          {host}
        </span>
      </div>
      <div
        className="relative flex min-h-[100px] flex-col justify-end px-4 py-4"
        style={{
          background: `linear-gradient(160deg, ${color}24 0%, #f6f6f5 55%, #ffffff 100%)`,
        }}
      >
        <div className="mb-3">
          <ResourceLogo r={r} size={featured ? 48 : 40} framed />
        </div>
        {r.note ? (
          <p className="line-clamp-2 text-[13.5px] leading-snug text-ink/75">{r.note}</p>
        ) : null}
      </div>
    </div>
  );
}

function ResourceLogo({
  r,
  size = 40,
  framed = false,
}: {
  r: Resource;
  size?: number;
  framed?: boolean;
}) {
  const src = resourceLogoUrl(r);
  const [failed, setFailed] = useState(false);
  const box = framed
    ? "rounded-xl border border-line bg-white shadow-soft"
    : "rounded-lg border border-line bg-surface";
  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- logo.dev
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        onError={() => setFailed(true)}
        className={cn("flex-none object-contain", box)}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className={cn("grid flex-none place-items-center font-bold", box, framed ? "btn-dark" : "bg-ink text-accent-ink")}
      style={{ width: size, height: size, fontSize: size > 36 ? 18 : 13 }}
    >
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
        "inline-flex min-h-8 items-center gap-1.5 rounded-lg px-2 font-mono text-[11px] transition-colors",
        armed || failed
          ? "bg-destructive text-accent-ink"
          : "text-muted-foreground hover:bg-accent-soft hover:text-ink",
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
  "flex flex-col gap-1.5 font-mono text-[10.5px] tracking-[0.1em] text-muted-foreground uppercase";

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
                  className="grid size-9 place-items-center rounded-pill text-muted-foreground hover:bg-accent-soft"
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
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-card font-mono text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <Plus className="size-4" aria-hidden />
            Ajouter une ressource
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import "@excalidraw/excalidraw/index.css";
import {
  convertToExcalidrawElements,
  Excalidraw,
} from "@excalidraw/excalidraw";
import type {
  BinaryFiles,
  ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types";
import { ArrowLeft, Loader2, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { renameSchema, saveSchemaScene } from "@/app/(app)/schemas/actions";
import { Illustration } from "@/components/illustration";
import type { SchemaKind, SchemaRow } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

export type SchemaEditorProps = {
  id: string;
  title: string;
  project: string | null;
  scene: SchemaRow["scene"];
  generate: {
    kind: Exclude<SchemaKind, "libre">;
    projectId: string;
    extra: string;
  } | null;
};

type Status = "idle" | "dirty" | "saving" | "saved" | "error";
type SceneElements = Parameters<
  NonNullable<React.ComponentProps<typeof Excalidraw>["onChange"]>
>[0];

/** Ce qui change quand on dessine (pas quand on bouge la souris ou zoome). */
function versionOf(elements: SceneElements) {
  let v = 0;
  for (const el of elements) v += el.version;
  return `${elements.length}:${v}`;
}

export function SchemaEditor({
  id,
  title: initialTitle,
  project,
  scene,
  generate,
}: SchemaEditorProps) {
  const [api, setApi] = useState<ExcalidrawImperativeAPI | null>(null);
  const [title, setTitle] = useState(initialTitle);
  const [status, setStatus] = useState<Status>("idle");
  const [agent, setAgent] = useState<"idle" | "running" | "error">(
    generate ? "running" : "idle",
  );
  const [agentError, setAgentError] = useState("");
  const pending = useRef<SchemaRow["scene"] | null>(null);
  const version = useRef(versionOf(scene.elements as SceneElements));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const started = useRef(false);

  const flush = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    const next = pending.current;
    if (!next) return;
    pending.current = null;
    setStatus("saving");
    const res = await saveSchemaScene(id, next);
    setStatus(res.ok ? "saved" : "error");
  }, [id]);

  const onChange = useCallback<
    NonNullable<React.ComponentProps<typeof Excalidraw>["onChange"]>
  >(
    (elements, appState, files) => {
      const v = versionOf(elements);
      if (v === version.current) return;
      version.current = v;
      const live = elements.filter((el) => !el.isDeleted);
      const used = new Set<string>(
        live.flatMap((el) =>
          el.type === "image" && el.fileId ? [el.fileId] : [],
        ),
      );
      pending.current = {
        elements: live as unknown[],
        appState: { viewBackgroundColor: appState.viewBackgroundColor },
        files: Object.fromEntries(
          Object.entries(files).filter(([fid]) => used.has(fid)),
        ),
      };
      setStatus("dirty");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(flush, 1000);
    },
    [flush],
  );

  // sauvegarde ce qui reste en quittant la page
  useEffect(() => {
    const onLeave = () => void flush();
    window.addEventListener("pagehide", onLeave);
    return () => {
      window.removeEventListener("pagehide", onLeave);
      void flush();
    };
  }, [flush]);

  const runAgent = useCallback(async () => {
    if (!api || !generate) return;
    setAgent("running");
    setAgentError("");
    try {
      const res = await fetch("/api/schemas/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(generate),
      });
      const data = (await res.json()) as { mermaid?: string; error?: string };
      if (!res.ok || !data.mermaid)
        throw new Error(data.error || "Le schéma n’a pas pu être généré.");
      const { parseMermaidToExcalidraw } =
        await import("@excalidraw/mermaid-to-excalidraw");
      let parsed;
      try {
        parsed = await parseMermaidToExcalidraw(data.mermaid, {
          themeVariables: { fontSize: "18px" },
        });
      } catch {
        throw new Error("L’agent a rendu un schéma illisible. Relance-le.");
      }
      const elements = convertToExcalidrawElements(parsed.elements, {
        regenerateIds: true,
      });
      // les fichiers d'abord : le onChange déclenché par updateScene les enregistre avec
      if (parsed.files) api.addFiles(Object.values(parsed.files));
      api.updateScene({ elements });
      api.scrollToContent(elements, { fitToContent: true, animate: true });
      setAgent("idle");
      window.history.replaceState(null, "", `/schemas/${id}`);
    } catch (e) {
      setAgent("error");
      setAgentError(
        e instanceof Error ? e.message : "Le schéma n’a pas pu être généré.",
      );
    }
  }, [api, generate, id]);

  useEffect(() => {
    if (!api || !generate || started.current) return;
    started.current = true;
    void runAgent();
  }, [api, generate, runAgent]);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/schemas"
          aria-label="Tous les schémas"
          className="grid size-11 flex-none place-items-center rounded-pill border border-line hover:bg-accent-soft"
        >
          <ArrowLeft className="size-4" aria-hidden />
        </Link>
        <div className="min-w-0 flex-1">
          <label htmlFor="schema-title" className="sr-only">
            Titre du schéma
          </label>
          <input
            id="schema-title"
            value={title}
            maxLength={120}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() =>
              title.trim() !== initialTitle && void renameSchema(id, title)
            }
            onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
            className="w-full truncate bg-transparent text-[20px] font-semibold tracking-[-0.03em] outline-none sm:text-[24px]"
          />
          {project ? (
            <p className="mono-label truncate">{`/ ${project}`}</p>
          ) : null}
        </div>
        <p
          aria-live="polite"
          className={cn(
            "font-mono text-[11px] text-muted-foreground",
            status === "error" && "text-destructive",
          )}
        >
          {status === "saving" || status === "dirty"
            ? "Enregistrement…"
            : status === "saved"
              ? "Enregistré"
              : status === "error"
                ? "Pas enregistré"
                : ""}
        </p>
      </div>

      <div className="relative h-[calc(100dvh-275px)] min-h-[420px] overflow-hidden rounded-card border border-line lg:h-[calc(100dvh-200px)]">
        <Excalidraw
          excalidrawAPI={setApi}
          initialData={{
            elements: scene.elements as SceneElements,
            appState: { viewBackgroundColor: "#ffffff", ...scene.appState },
            files: (scene.files ?? {}) as BinaryFiles,
            scrollToContent: true,
          }}
          onChange={onChange}
          langCode="fr-FR"
          UIOptions={{
            canvasActions: { loadScene: false, saveToActiveFile: false },
          }}
        />

        {agent !== "idle" ? (
          <div className="absolute inset-0 z-10 grid place-items-center bg-surface/80 backdrop-blur-[2px]">
            <div
              role="status"
              className="flex max-w-[34ch] flex-col items-center gap-2 text-center"
            >
              <Illustration
                name={
                  agent === "error" ? "feedback-erreur" : "dashboard-au-travail"
                }
                className={cn(
                  "size-24",
                  agent === "running" && "animate-pulse",
                )}
              />
              {agent === "running" ? (
                <p className="inline-flex items-center gap-2 text-[14.5px] text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  L’agent dessine ton schéma…
                </p>
              ) : (
                <>
                  <p className="text-[14.5px] text-destructive">{agentError}</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => void runAgent()}
                      className="btn-dark inline-flex min-h-11 items-center gap-1.5 rounded-pill px-4 text-[14px] font-semibold"
                    >
                      <RotateCcw className="size-4" aria-hidden />
                      Relancer
                    </button>
                    <button
                      type="button"
                      onClick={() => setAgent("idle")}
                      className="inline-flex min-h-11 items-center rounded-pill border border-line bg-surface px-4 text-[14px] font-medium"
                    >
                      Dessiner à la main
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

"use client";

import dynamic from "next/dynamic";
import { Illustration } from "@/components/illustration";
import type { SchemaEditorProps } from "./schema-editor";

const SchemaEditor = dynamic(
  () => import("./schema-editor").then((m) => m.SchemaEditor),
  {
    ssr: false,
    loading: () => (
      <div role="status" className="grid h-[70dvh] place-items-center">
        <div className="flex flex-col items-center gap-2">
          <Illustration
            name="feedback-chargement"
            className="size-20 animate-pulse"
          />
          <p className="mono-label">Ouverture du tableau…</p>
        </div>
      </div>
    ),
  },
);

/** Excalidraw ne tourne que dans le navigateur : chargé à part, uniquement sur cette page. */
export function SchemaEditorLoader(props: SchemaEditorProps) {
  return <SchemaEditor {...props} />;
}

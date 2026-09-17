import type * as React from "react";

type RenderProp = React.ReactElement | ((...args: never[]) => React.ReactElement) | undefined;

function estElementReact(render: RenderProp): render is React.ReactElement {
  return render != null && typeof render !== "function";
}

function estComposantButton(type: unknown): boolean {
  if (typeof type !== "function") return false;
  const fn = type as { displayName?: string; name?: string };
  const nom = fn.displayName ?? fn.name ?? "";
  return nom === "Button";
}

/** Déduit si Base UI doit traiter l'élément `render` comme un vrai <button>. */
export function resolveNativeButton(nativeButton: boolean | undefined, render: RenderProp): boolean {
  if (nativeButton !== undefined) return nativeButton;
  if (!render) return true;
  if (!estElementReact(render)) return false;
  if (typeof render.type === "string") return render.type === "button";
  return estComposantButton(render.type);
}

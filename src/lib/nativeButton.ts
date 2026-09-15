import type * as React from "react";

type RenderProp = React.ReactElement | ((...args: never[]) => React.ReactElement) | undefined;

function estElementReact(render: RenderProp): render is React.ReactElement {
  return render != null && typeof render !== "function";
}

/** Déduit si Base UI doit traiter l'élément `render` comme un vrai <button>. */
export function resolveNativeButton(nativeButton: boolean | undefined, render: RenderProp): boolean {
  if (nativeButton !== undefined) return nativeButton;
  if (!render) return true;
  if (!estElementReact(render)) return false;
  return typeof render.type === "string" && render.type === "button";
}

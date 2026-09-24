"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";

export type FrameStageHandle = { replay: () => void };

/**
 * Aperçu isolé dans une iframe srcdoc : ses styles ne touchent pas l'app.
 * Sans allow-same-origin, le contenu ne peut pas lire l'app ; il envoie sa hauteur par postMessage.
 */
export const FrameStage = forwardRef<
  FrameStageHandle,
  { doc: string; title: string; kit?: string; minHeight?: number }
>(function FrameStage({ doc, title, kit, minHeight = 160 }, ref) {
  const iframe = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(minHeight);

  const send = useCallback((data: object) => {
    iframe.current?.contentWindow?.postMessage(data, "*");
  }, []);

  useImperativeHandle(ref, () => ({ replay: () => send({ replay: 1 }) }), [send]);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.source !== iframe.current?.contentWindow) return;
      const h = (e.data as { navpitFrame?: number; h?: number })?.h;
      if (typeof h === "number" && h > 0) setHeight(h);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (kit) send({ kit });
  }, [kit, send]);

  return (
    <iframe
      ref={iframe}
      title={title}
      srcDoc={doc}
      sandbox="allow-scripts"
      loading="lazy"
      onLoad={() => kit && send({ kit })}
      style={{ height }}
      className="block w-full border-0"
    />
  );
});

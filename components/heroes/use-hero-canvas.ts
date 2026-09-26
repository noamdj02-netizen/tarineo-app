"use client";

import { useEffect, useRef } from "react";

export type HeroDraw = (
  ctx: CanvasRenderingContext2D,
  frame: {
    t: number;
    w: number;
    h: number;
    mx: number;
    my: number;
    reduced: boolean;
    mobile: boolean;
  },
) => void;

export function useHeroCanvas(draw: HeroDraw, deps: unknown[] = []) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let mx = 0.5;
    let my = 0.5;
    let visible = true;
    let raf = 0;
    const start = performance.now();

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
      },
      { threshold: 0.05 },
    );
    io.observe(canvas);

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width;
      my = (e.clientY - r.top) / r.height;
    };
    canvas.addEventListener("pointermove", onMove);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const tick = (now: number) => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (visible && w && h) {
        draw(ctx, {
          t: reduced ? 0 : (now - start) / 1000,
          w,
          h,
          mx,
          my,
          reduced,
          mobile: w < 768,
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      canvas.removeEventListener("pointermove", onMove);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}

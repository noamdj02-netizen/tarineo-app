"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import { HeroCaptureScope, HeroStage, useHeroCapture } from "./hero-stage";
import { useHeroCanvas } from "./use-hero-canvas";

function hex(c: string, fallback: string) {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(c) ? c : fallback;
}

function n(v: string, fallback: number) {
  const x = Number(v);
  return Number.isFinite(x) ? x : fallback;
}

function CanvasBack({
  values,
  draw,
  className = "",
}: {
  values: Record<string, string>;
  draw: Parameters<typeof useHeroCanvas>[0];
  className?: string;
}) {
  const ref = useHeroCanvas(draw, [JSON.stringify(values)]);
  return <canvas ref={ref} className={`absolute inset-0 size-full ${className}`} aria-hidden />;
}

export function PreviewAnneau({ values }: { values: Record<string, string> }) {
  const reduce = useReducedMotion();
  const compact = useHeroCapture();
  const accent = hex(values.COULEUR_ACCENT, "#8A9199");
  return (
    <HeroStage values={values}>
      {compact ? null : (
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 48%, ${accent}40, transparent 55%)`,
        }}
      />
      )}
      <motion.div
        className={
          compact
            ? "pointer-events-none absolute inset-0 opacity-0"
            : "absolute top-1/2 left-1/2 size-[min(72%,240px)] -translate-x-1/2 -translate-y-1/2"
        }
        initial={reduce ? false : { opacity: 0, scale: 0.4 }}
        animate={{ opacity: compact ? 0 : 1, scale: 1 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          className="size-full rounded-full border-[18px] opacity-90 motion-safe:animate-spin"
          style={{
            borderColor: "rgba(255,255,255,0.45)",
            background: `conic-gradient(from 120deg, transparent, ${accent}88, transparent 40%)`,
            boxShadow: `inset 0 0 40px ${accent}88, 0 16px 40px ${accent}44`,
            animationDuration: `${12 / Math.max(0.08, n(values.VITESSE_ROTATION, 0.18))}s`,
          }}
        />
      </motion.div>
    </HeroStage>
  );
}

export function PreviewProduit({ values }: { values: Record<string, string> }) {
  const compact = useHeroCapture();
  const phrases = values.SOUS_TITRE.split(/[.!]/).map((s) => s.trim()).filter(Boolean).slice(0, 3);
  const lines = phrases.length ? phrases : ["Valide", "Porte", "Relance"];
  if (compact) return <HeroStage values={values} />;
  return (
    <HeroStage values={values}>
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="flex h-[78%] w-[42%] flex-col items-center justify-around">
          {lines.map((line, i) => (
            <div key={line} className="text-center">
              <div
                className="mx-auto mb-1.5 h-16 w-10 rounded-lg border border-white/50 shadow-lg"
                style={{
                  background: `linear-gradient(160deg, ${values.COULEUR_ACCENT}, ${values.COULEUR_TEXTE})`,
                  transform: `rotateY(${i * 28}deg) rotateZ(${i * 4 - 4}deg)`,
                }}
              />
              <p className="text-[10px] font-medium text-white drop-shadow">{line}</p>
            </div>
          ))}
        </div>
      </div>
    </HeroStage>
  );
}

export function PreviewGlobe({ values }: { values: Record<string, string> }) {
  const accent = hex(values.COULEUR_ACCENT, "#2F5F7A");
  return (
    <HeroStage values={values}>
      <CanvasBack
        values={values}
        draw={(ctx, { t, w, h, reduced, mobile }) => {
          ctx.clearRect(0, 0, w, h);
          const cx = w * 0.5;
          const cy = h * 0.5;
          const r = Math.min(w, h) * 0.36;
          const count = mobile ? 400 : 900;
          ctx.fillStyle = accent;
          for (let i = 0; i < count; i++) {
            const th = ((i * 137.5) % 360) * (Math.PI / 180);
            const ph = Math.acos(1 - (2 * (i + 0.5)) / count);
            const rot = reduced ? 0 : t * 0.25;
            const x = Math.sin(ph) * Math.cos(th + rot);
            const y = Math.cos(ph);
            const z = Math.sin(ph) * Math.sin(th + rot);
            if (z < -0.15) continue;
            ctx.globalAlpha = 0.25 + z * 0.55;
            ctx.fillRect(cx + x * r, cy + y * r, 1.6, 1.6);
          }
          ctx.globalAlpha = 0.55;
          ctx.strokeStyle = accent;
          ctx.beginPath();
          ctx.arc(cx, cy - r * 0.2, r * 0.7, 0.2, 1.4);
          ctx.stroke();
        }}
      />
    </HeroStage>
  );
}

export function PreviewSoie({ values }: { values: Record<string, string> }) {
  const a = hex(values.COULEUR_ACCENT, "#D4785A");
  const b = hex(values.COULEUR_SOIE_2, "#E8B4A0");
  const c = hex(values.COULEUR_SOIE_3, "#C9A8C4");
  const speed = n(values.VITESSE, 0.35);
  return (
    <HeroStage values={values} layout="overlay">
      <CanvasBack
        values={values}
        className="opacity-70 mix-blend-multiply"
        draw={(ctx, { t, w, h, mx, my, reduced }) => {
          const g = ctx.createLinearGradient(0, 0, w, h);
          const o = reduced ? 0 : Math.sin(t * speed) * 0.15;
          g.addColorStop(0, a);
          g.addColorStop(0.5 + o, b);
          g.addColorStop(1, c);
          ctx.fillStyle = g;
          ctx.globalAlpha = 0.55;
          ctx.fillRect(0, 0, w, h);
          ctx.globalAlpha = 0.22;
          for (let y = 0; y < h; y += 10) {
            ctx.beginPath();
            for (let x = 0; x <= w; x += 16) {
              const wave = reduced
                ? 0
                : Math.sin(x * 0.012 + t * speed + y * 0.01) * 14 +
                  Math.sin((x - mx * w) * 0.02) * Math.exp(-((y / h - my) ** 2) * 18) * 22;
              ctx.lineTo(x, y + wave);
            }
            ctx.strokeStyle = "#fff";
            ctx.stroke();
          }
          ctx.globalAlpha = 0.07;
          for (let i = 0; i < 400; i++) ctx.fillRect((i * 97) % w, (i * 53) % h, 1, 1);
          ctx.globalAlpha = 1;
        }}
      />
    </HeroStage>
  );
}

export function PreviewTopo({ values }: { values: Record<string, string> }) {
  const color = hex(values.COULEUR_TEXTE, "#243024");
  const dens = n(values.DENSITE, 18);
  return (
    <HeroStage values={values}>
      <CanvasBack
        values={values}
        draw={(ctx, { t, w, h, mx, my, reduced }) => {
          ctx.clearRect(0, 0, w, h);
          ctx.strokeStyle = color;
          ctx.globalAlpha = 0.35;
          ctx.lineWidth = 1.1;
          const step = Math.max(8, 220 / dens);
          for (let i = 0; i < dens; i++) {
            ctx.beginPath();
            for (let x = 0; x <= w; x += 8) {
              const nx = x / 90;
              const base = Math.sin(nx + i * 0.4 + (reduced ? 0 : t * 0.2)) * 18;
              const pull = Math.exp(-((x / w - mx) ** 2 + (i / dens - my) ** 2) * 14) * 28;
              ctx.lineTo(x, h * 0.12 + i * step + base - pull);
            }
            ctx.stroke();
          }
          ctx.globalAlpha = 1;
        }}
      />
    </HeroStage>
  );
}

export function PreviewGoutte({ values }: { values: Record<string, string> }) {
  const accent = hex(values.COULEUR_ACCENT, "#E8A0A0");
  const count = Math.min(6, Math.max(2, Math.round(n(values.NOMBRE_GOUTTES, 4))));
  return (
    <HeroStage values={values}>
      <CanvasBack
        values={values}
        className="opacity-80"
        draw={(ctx, { t, w, h, mx, my, reduced }) => {
          const img = ctx.createImageData(w, h);
          const data = img.data;
          const blobs = Array.from({ length: count }, (_, i) => {
            const follow = i === 0;
            return {
              x: follow ? mx * w : w * (0.35 + 0.15 * Math.sin(t * 0.7 + i)),
              y: follow ? my * h : h * (0.4 + 0.12 * Math.cos(t * 0.5 + i)),
              r: 56 + i * 14,
            };
          });
          const step = reduced ? 4 : 3;
          for (let y = 0; y < h; y += step) {
            for (let x = 0; x < w; x += step) {
              let f = 0;
              for (const b of blobs) {
                const dx = x - b.x;
                const dy = y - b.y;
                f += (b.r * b.r) / (dx * dx + dy * dy + 1);
              }
              if (f > 1.1) {
                const i = (y * w + x) * 4;
                data[i] = parseInt(accent.slice(1, 3), 16);
                data[i + 1] = parseInt(accent.slice(3, 5), 16);
                data[i + 2] = parseInt(accent.slice(5, 7), 16);
                data[i + 3] = 200;
              }
            }
          }
          ctx.putImageData(img, 0, 0);
        }}
      />
    </HeroStage>
  );
}

export function PreviewPoussiere({ values }: { values: Record<string, string> }) {
  const accent = hex(values.COULEUR_ACCENT, "#D4A017");
  const duree = n(values.DUREE_ASSEMBLAGE, 2.5);
  return (
    <HeroStage values={values} layout="overlay">
      <CanvasBack
        values={values}
        draw={(ctx, { t, w, h, mx, my, reduced, mobile }) => {
          ctx.clearRect(0, 0, w, h);
          const nPts = mobile ? 500 : 1600;
          const p = reduced ? 1 : Math.min(1, t / duree);
          ctx.fillStyle = accent;
          for (let i = 0; i < nPts; i++) {
            const seed = i * 12.9898;
            const tx = w * 0.52 + Math.sin(seed) * 110;
            const ty = h * 0.42 + Math.cos(seed * 1.3) * 40;
            const fx = (Math.sin(seed * 2.1) * 0.5 + 0.5) * w;
            const fy = (Math.cos(seed * 1.7) * 0.5 + 0.5) * h;
            let x = fx + (tx - fx) * p;
            let y = fy + (ty - fy) * p;
            const d = Math.hypot(x - mx * w, y - my * h);
            if (d < 50) {
              x += ((x - mx * w) / (d + 1)) * 18;
              y += ((y - my * h) / (d + 1)) * 18;
            }
            ctx.globalAlpha = 0.45 + p * 0.4;
            ctx.fillRect(x, y, 1.3, 1.3);
          }
          ctx.globalAlpha = p;
          ctx.fillStyle = values.COULEUR_TEXTE || "#F3E6C8";
          ctx.font = `500 ${Math.min(w, h) * 0.11}px Inter Tight, sans-serif`;
          ctx.fillText(values.MARQUE || "Kino", w * 0.38, h * 0.48);
          ctx.globalAlpha = 1;
        }}
      />
    </HeroStage>
  );
}

export function PreviewConstellation({ values }: { values: Record<string, string> }) {
  const accent = hex(values.COULEUR_ACCENT, "#7C6B9A");
  const seuil = n(values.SEUIL_LIEN, 90);
  const pts = useMemo(
    () =>
      Array.from({ length: 48 }, (_, i) => ({
        x: (Math.sin(i * 12.9) * 0.5 + 0.5) * 0.9 + 0.05,
        y: (Math.cos(i * 8.2) * 0.5 + 0.5) * 0.9 + 0.05,
      })),
    [],
  );
  return (
    <HeroStage values={values}>
      <CanvasBack
        values={values}
        draw={(ctx, { t, w, h, mx, my, reduced, mobile }) => {
          ctx.clearRect(0, 0, w, h);
          const list = pts.slice(0, mobile ? 22 : 48).map((p, i) => {
            const x = reduced ? p.x * w : ((p.x + Math.sin(t * 0.2 + i) * 0.03) % 1) * w;
            const y = reduced ? p.y * h : ((p.y + Math.cos(t * 0.15 + i) * 0.03) % 1) * h;
            const pull = Math.hypot(x - mx * w, y - my * h);
            const ax = pull < 120 ? (mx * w - x) * 0.08 : 0;
            const ay = pull < 120 ? (my * h - y) * 0.08 : 0;
            return { x: x + ax, y: y + ay };
          });
          ctx.strokeStyle = accent;
          ctx.fillStyle = accent;
          for (let i = 0; i < list.length; i++) {
            for (let j = i + 1; j < list.length; j++) {
              const d = Math.hypot(list[i].x - list[j].x, list[i].y - list[j].y);
              if (d < seuil) {
                ctx.globalAlpha = 1 - d / seuil;
                ctx.beginPath();
                ctx.moveTo(list[i].x, list[i].y);
                ctx.lineTo(list[j].x, list[j].y);
                ctx.stroke();
              }
            }
          }
          ctx.globalAlpha = 0.9;
          for (const p of list) ctx.fillRect(p.x - 1.2, p.y - 1.2, 2.4, 2.4);
          ctx.globalAlpha = 1;
        }}
      />
    </HeroStage>
  );
}

export function PreviewVideoTitre({ values }: { values: Record<string, string> }) {
  const accent = hex(values.COULEUR_ACCENT, "#E07A3D");
  const photo = values.URL_POSTER || values.URL_PORTRAIT;
  return (
    <HeroStage values={values}>
      <div className="absolute inset-0 grid place-items-center p-4">
        <p
          className="max-w-full text-center text-[clamp(36px,12vw,88px)] leading-[0.85] font-semibold tracking-tightest"
          style={{
            backgroundImage: photo
              ? `url(${photo})`
              : `linear-gradient(120deg, ${accent}, #f3e6d0, ${accent})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            WebkitTextFillColor: "transparent",
          }}
        >
          {values.TITRE.split(" ").slice(0, 2).join(" ")}
        </p>
      </div>
    </HeroStage>
  );
}

export function PreviewVideoDecoupe({ values }: { values: Record<string, string> }) {
  const reduce = useReducedMotion();
  const words = values.TITRE.split(/\s+/);
  return (
    <HeroStage values={values} layout="overlay">
      {values.URL_VIDEO ? (
        <video
          className="absolute inset-0 size-full object-cover"
          src={values.URL_VIDEO}
          poster={values.URL_POSTER || values.URL_PORTRAIT || undefined}
          muted
          playsInline
          loop
          autoPlay={!reduce}
        />
      ) : (
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at 60% 40%, ${values.COULEUR_ACCENT}, transparent 55%)`,
          }}
        />
      )}
      <div className="sr-only">{words.join(" ")}</div>
    </HeroStage>
  );
}

export function PreviewCaptures({ values }: { values: Record<string, string> }) {
  const compact = useHeroCapture();
  const reduce = useReducedMotion();
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const urls = [values.URL_CAPTURE_1, values.URL_CAPTURE_2, values.URL_CAPTURE_3];
  if (compact) return <HeroStage values={values} />;
  return (
    <HeroStage values={values}>
      <div
        className="absolute inset-[12%] "
        style={{ perspective: 900 }}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setTilt({
            x: ((e.clientY - r.top) / r.height - 0.5) * -10,
            y: ((e.clientX - r.left) / r.width - 0.5) * 10,
          });
        }}
      >
        {urls.map((src, i) => (
          <motion.div
            key={i}
            className="absolute inset-0 overflow-hidden rounded-xl border border-white/40 bg-white/70 shadow-lg"
            initial={reduce ? false : { y: 24, opacity: 0 }}
            animate={{
              y: i * -14,
              x: i * 16,
              opacity: 1,
              rotateX: tilt.x,
              rotateY: tilt.y,
            }}
            transition={{ delay: i * 0.12, duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
          >
            {src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt="" className="size-full object-cover" />
            ) : (
              <div className="flex h-full flex-col gap-2 p-3">
                <div className="h-2.5 w-1/3 rounded bg-black/15" />
                <div className="h-12 rounded bg-black/8" />
                <div className="h-12 rounded bg-black/8" />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </HeroStage>
  );
}

export function PreviewTerminal({ values }: { values: Record<string, string> }) {
  const compact = useHeroCapture();
  const cmds = values.COMMANDES.split("|").map((s) => s.trim()).filter(Boolean);
  const reduce = useReducedMotion();
  if (compact) return <HeroStage values={values} />;
  return (
    <HeroStage values={values}>
      <div className="absolute inset-3 flex flex-col justify-end gap-2">
        <pre className="min-h-28 overflow-hidden rounded-xl bg-[#1A1F16]/88 p-3 font-mono text-[11px] leading-relaxed text-[#E8F0E4]">
          {cmds.map((c, i) => (
            <div key={c}>
              <span className="opacity-50">$</span>{" "}
              <motion.span
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.7 }}
              >
                {c}
              </motion.span>
            </div>
          ))}
        </pre>
      </div>
    </HeroStage>
  );
}

const REGISTRY: Record<string, React.ComponentType<{ values: Record<string, string> }>> = {
  "anneau-de-verre": PreviewAnneau,
  "produit-scroll": PreviewProduit,
  "globe-points": PreviewGlobe,
  "ruban-soie": PreviewSoie,
  "lignes-topographiques": PreviewTopo,
  "goutte-liquide": PreviewGoutte,
  "poussiere-logo": PreviewPoussiere,
  "constellation-connectee": PreviewConstellation,
  "video-dans-le-titre": PreviewVideoTitre,
  "video-titre-decoupe": PreviewVideoDecoupe,
  "captures-empilees": PreviewCaptures,
  "terminal-qui-construit": PreviewTerminal,
};

export function HeroPreview({
  slug,
  values,
  capture = false,
}: {
  slug: string;
  values: Record<string, string>;
  capture?: boolean;
}) {
  const Cmp = REGISTRY[slug] ?? PreviewConstellation;
  return (
    <HeroCaptureScope capture={capture}>
      <Cmp values={values} />
    </HeroCaptureScope>
  );
}

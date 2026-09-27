"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import type { HeroVideo } from "@/lib/site/tarineo";

/**
 * Fond du hero. Priorité : vidéo (desktop) + poster (mobile) → photo → scène vectorielle de chantier.
 * Caméra lente : zoom 1 → 1,05 sur 20 s, parallaxe légère au scroll, grain et halo discrets.
 * Si `image` est fourni (photo réelle), elle remplace la scène vectorielle avec le même traitement.
 */
export function HeroBackdrop({
  video,
  image,
  alt,
}: {
  video?: HeroVideo | null;
  image?: string | null;
  alt?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 90]);

  if (video) {
    return (
      <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-black">
        {/* Desktop : vidéo (webm puis mp4). Masquée si l'utilisateur réduit les animations. */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={video.poster}
          className="absolute inset-0 hidden h-full w-full object-cover md:block motion-reduce:md:hidden"
        >
          <source src={video.webm} type="video/webm" />
          <source src={video.mp4} type="video/mp4" />
        </video>
        {/* Desktop, animations réduites : image fixe. */}
        <Image
          src={video.poster}
          alt=""
          fill
          priority
          sizes="100vw"
          className="hidden object-cover motion-reduce:md:block"
        />
        {/* Mobile : poster léger, pas de vidéo. */}
        <Image src={video.posterMobile} alt="" fill priority sizes="100vw" className="object-cover md:hidden" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-black/25" />
        {/* Raccord avec la section suivante (#050505), sous le bloc texte */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[#050505]" />
      </div>
    );
  }

  return (
    <div ref={ref} aria-hidden={image ? undefined : true} className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-[#050505]">
      <motion.div className="absolute inset-[-4%]" style={{ y }}>
        <motion.div
          className="absolute inset-0 will-change-transform"
          initial={{ scale: 1 }}
          animate={reduce ? { scale: 1 } : { scale: 1.05 }}
          transition={
            reduce ? { duration: 0 } : { duration: 20, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }
          }
        >
          {image ? (
            <Image
              src={image}
              alt={alt ?? ""}
              fill
              priority
              sizes="100vw"
              className="object-cover [filter:saturate(0.75)_contrast(1.05)]"
            />
          ) : (
            <ConstructionScene />
          )}
        </motion.div>
      </motion.div>

      {/* Voile dégradé noir ~60 % : le texte reste lisible quelle que soit la photo */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.6)_55%,rgba(0,0,0,0.7)_100%)]" />
      {/* Vignette + fondu vers la page */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_60%_at_50%_42%,transparent_0%,rgba(0,0,0,0.55)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[38%] bg-[linear-gradient(180deg,transparent_0%,#050505_92%)]" />
      {/* Halo lumineux très léger (éclairage de chantier) */}
      <div className="absolute top-[-10%] right-[4%] h-[55%] w-[45%] rounded-full bg-[radial-gradient(closest-side,rgba(236,88,33,0.10),transparent_72%)] blur-2xl" />
      <div className="film-grain absolute inset-0 opacity-[0.07] mix-blend-overlay" />
    </div>
  );
}

const MAST_X = 1066;
const MAST_W = 28;
const JIB_Y = 200;
const JIB_H = 26;
const JIB_TIP = 250;
const GROUND = 890;

/** Scène vectorielle : ciel industriel, immeuble en structure, grue à tour, charge suspendue. */
function ConstructionScene() {
  const mastSteps = Array.from({ length: Math.floor((GROUND - JIB_Y - JIB_H) / MAST_W) }, (_, i) => JIB_Y + JIB_H + i * MAST_W);
  const jibSteps = Array.from({ length: Math.floor((MAST_X - JIB_TIP) / 30) }, (_, i) => JIB_TIP + i * 30);
  const counterSteps = Array.from({ length: 8 }, (_, i) => MAST_X + MAST_W + i * 30);
  const floors = [890, 820, 750, 680, 610, 540, 470, 400];
  const columns = Array.from({ length: 8 }, (_, i) => 1150 + i * 58);
  const litWindows: [number, number][] = [
    [1170, 842], [1286, 842], [1402, 772], [1228, 772], [1344, 702], [1170, 632], [1460, 842], [1402, 632],
  ];

  return (
    <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#030303" />
          <stop offset="0.55" stopColor="#0b0a09" />
          <stop offset="0.9" stopColor="#1c130d" />
          <stop offset="1" stopColor="#140e0a" />
        </linearGradient>
        <radialGradient id="haze" cx="0.72" cy="0.9" r="0.55">
          <stop offset="0" stopColor="#ff8a4c" stopOpacity="0.22" />
          <stop offset="1" stopColor="#ff8a4c" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="cone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd2a8" stopOpacity="0.16" />
          <stop offset="1" stopColor="#ffd2a8" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="beaconGlow">
          <stop offset="0" stopColor="#ff5a24" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ff5a24" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="1600" height="1000" fill="url(#sky)" />
      <rect width="1600" height="1000" fill="url(#haze)" />

      {/* Ville lointaine */}
      <g fill="#0d0c0b">
        {[
          [0, 830, 90], [80, 800, 60], [130, 845, 120], [240, 815, 70], [300, 790, 55], [350, 840, 140],
          [480, 822, 80], [550, 850, 160], [700, 835, 90], [780, 812, 60], [1500, 820, 100],
        ].map(([x, y, w]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width={w} height={GROUND - y + 10} />
        ))}
      </g>

      {/* Grue lointaine, très estompée */}
      <g stroke="#ffffff" strokeOpacity="0.07" strokeWidth="2" fill="none">
        <path d="M300 890V430M312 890V430M300 430h12" />
        <path d="M120 420h340M120 432h340M306 380l-6 40M306 380l6 40M306 380L150 420M306 380l150 40" />
        <path d="M200 432v150" strokeOpacity="0.05" />
      </g>

      {/* Immeuble en construction */}
      <g>
        <rect x="1130" y="610" width="440" height="280" fill="#0f0e0d" />
        {floors.map((y) => (
          <rect key={y} x="1122" y={y - 8} width="456" height="9" fill="#2a2724" />
        ))}
        {columns.map((x) => (
          <rect key={x} x={x} y="400" width="9" height="490" fill="#1f1d1b" />
        ))}
        {litWindows.map(([x, y], i) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="30" height="22" fill="#ffb37a" opacity={0.35 + (i % 3) * 0.15} />
        ))}
        {/* Armatures en attente au dernier niveau */}
        <g stroke="#3a3632" strokeWidth="2">
          {columns.map((x) => (
            <path key={x} d={`M${x + 2} 400v-26M${x + 7} 400v-20`} />
          ))}
        </g>
        {/* Échafaudage */}
        <g stroke="#ffffff" strokeOpacity="0.09" strokeWidth="1.5" fill="none">
          {[1100, 1116].map((x) => (
            <path key={x} d={`M${x} 540V${GROUND}`} />
          ))}
          {[540, 610, 680, 750, 820].map((y) => (
            <path key={y} d={`M1100 ${y}h16M1100 ${y}l16 70`} />
          ))}
        </g>
      </g>

      {/* Projecteur et cône de lumière */}
      <polygon points="1122,540 1128,540 1340,890 880,890" fill="url(#cone)" />
      <rect x="1116" y="534" width="16" height="8" rx="2" fill="#ffe2c4" opacity="0.9" />

      {/* Grue à tour */}
      <g stroke="#3b3835" strokeWidth="2.2" fill="none">
        {/* Mât */}
        <path d={`M${MAST_X} ${GROUND}V${JIB_Y}M${MAST_X + MAST_W} ${GROUND}V${JIB_Y}`} />
        {mastSteps.map((y) => (
          <path key={y} d={`M${MAST_X} ${y}L${MAST_X + MAST_W} ${y + MAST_W}M${MAST_X} ${y}h${MAST_W}`} strokeWidth="1.4" />
        ))}
        {/* Flèche */}
        <path d={`M${JIB_TIP} ${JIB_Y}H${MAST_X}M${JIB_TIP + 6} ${JIB_Y + JIB_H}H${MAST_X}`} />
        {jibSteps.map((x) => (
          <path key={x} d={`M${x} ${JIB_Y + (x === JIB_TIP ? 0 : 0)}L${x + 15} ${JIB_Y + JIB_H}L${x + 30} ${JIB_Y}`} strokeWidth="1.3" />
        ))}
        {/* Contre-flèche */}
        <path d={`M${MAST_X + MAST_W} ${JIB_Y}h250M${MAST_X + MAST_W} ${JIB_Y + 20}h250`} />
        {counterSteps.map((x) => (
          <path key={x} d={`M${x} ${JIB_Y}l15 20l15 -20`} strokeWidth="1.3" />
        ))}
        {/* Porte-flèche et tirants */}
        <path d={`M${MAST_X} ${JIB_Y}L${MAST_X + MAST_W / 2} 120L${MAST_X + MAST_W} ${JIB_Y}`} />
        <path d={`M${MAST_X + MAST_W / 2} 120L520 ${JIB_Y}M${MAST_X + MAST_W / 2} 120L${MAST_X + 270} ${JIB_Y}`} strokeWidth="1.2" strokeOpacity="0.8" />
      </g>
      {/* Contrepoids et cabine */}
      <rect x={MAST_X + 205} y={JIB_Y + 20} width="64" height="44" fill="#1c1a18" stroke="#3b3835" strokeWidth="2" />
      <rect x={MAST_X + MAST_W} y={JIB_Y + JIB_H} width="30" height="26" rx="3" fill="#1c1a18" stroke="#3b3835" strokeWidth="2" />
      <rect x={MAST_X + MAST_W + 6} y={JIB_Y + JIB_H + 6} width="18" height="10" fill="#ffc796" opacity="0.7" />

      {/* Chariot, câble et charge (balancement lent) */}
      <g className="origin-[720px_226px] animate-[crane-sway_9s_ease-in-out_infinite] [transform-box:view-box] motion-reduce:animate-none">
        <rect x="706" y={JIB_Y + JIB_H - 2} width="28" height="10" fill="#2a2724" />
        <path d="M716 234V560M724 234V560" stroke="#4a4540" strokeWidth="1.4" />
        <rect x="710" y="558" width="20" height="18" rx="2" fill="#3b3835" />
        <path d="M720 576L648 612M720 576L792 612" stroke="#4a4540" strokeWidth="1.3" />
        <rect x="628" y="610" width="184" height="12" fill="#2d2a27" stroke="#4a4540" strokeWidth="1" />
      </g>

      {/* Balises */}
      <circle cx={MAST_X + MAST_W / 2} cy="114" r="18" fill="url(#beaconGlow)" className="animate-[beacon_3.6s_ease-in-out_infinite]" />
      <circle cx={MAST_X + MAST_W / 2} cy="114" r="3.2" fill="#ff5a24" />
      <circle cx={JIB_TIP} cy={JIB_Y - 4} r="12" fill="url(#beaconGlow)" className="animate-[beacon_3.6s_ease-in-out_-1.8s_infinite]" />
      <circle cx={JIB_TIP} cy={JIB_Y - 4} r="2.6" fill="#ff5a24" />

      {/* Sol */}
      <rect x="0" y={GROUND} width="1600" height={1000 - GROUND} fill="#080706" />
    </svg>
  );
}

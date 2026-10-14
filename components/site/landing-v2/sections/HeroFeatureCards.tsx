import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";

import { HeroChantiersCard } from "@/components/site/landing-v2/sections/HeroChantiersCard";
import { cn } from "@/lib/utils";

type ImageCard = {
  kind: "image";
  nodeId: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
};

type ChantiersCard = {
  kind: "chantiers";
  nodeId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
};

/** Positions dans `235:33491` (Frame 868) — métadonnées Figma. */
const CARDS: (ImageCard | ChantiersCard)[] = [
  {
    kind: "image",
    nodeId: "235:33492",
    src: "/landing/figma/hero/hero-card-pdf.png",
    x: 0,
    y: 38,
    width: 281,
    height: 293,
    label:
      "PDF fournisseurs, lus au même endroit — tout le suivi d'un chantier, au même endroit.",
  },
  {
    kind: "image",
    nodeId: "235:33551",
    src: "/landing/figma/hero/hero-card-chatbot.png",
    x: 301,
    y: 99,
    width: 281,
    height: 232,
    label:
      "Ai Chatbot — Posez une question sur une pièce fournisseur : Tarineo résume les hausses et les lignes à valider.",
  },
  {
    kind: "image",
    nodeId: "235:33574",
    src: "/landing/figma/hero/hero-card-pieces.png",
    x: 601,
    y: 101,
    width: 281,
    height: 230,
    label:
      "Pièces rattachées — Devis, relances et photos dans le même dossier, prêts à ouvrir.",
  },
  {
    kind: "chantiers",
    nodeId: "235:33614",
    x: 902,
    y: 0,
    width: 281,
    height: 331,
    label:
      "Un dossier par chantier — Réfection cuisine Benali, Mise aux normes Martin, avec statut Active.",
  },
];

function HeroCardShell({
  nodeId,
  label,
  className,
  style,
  children,
}: {
  nodeId: string;
  label: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div data-node-id={nodeId} style={style} className={className}>
      {children}
      <p className="sr-only">{label}</p>
    </div>
  );
}

function HeroCardImage({
  card,
  className,
  style,
  responsive,
}: {
  card: ImageCard;
  className?: string;
  style?: CSSProperties;
  responsive?: boolean;
}) {
  return (
    <HeroCardShell nodeId={card.nodeId} label={card.label} style={style} className={className}>
      <article
        className={cn(
          "overflow-hidden rounded-[20px] bg-[#fcfcfc] shadow-[0_0_0_4px_#ffffff] outline outline-1 outline-offset-[-1px] outline-[#f2f2f2]",
          responsive && "w-full min-w-0",
        )}
      >
        <Image
          src={card.src}
          alt=""
          width={card.width}
          height={card.height}
          className={cn(
            responsive
              ? "block h-auto w-full max-w-full object-cover object-top"
              : "block w-[281px] max-w-none object-cover object-top",
          )}
          style={responsive ? undefined : { height: card.height }}
          sizes={responsive ? "(max-width: 1023px) 100vw, 281px" : "281px"}
        />
      </article>
    </HeroCardShell>
  );
}

function HeroCard({
  card,
  className,
  style,
  responsive,
}: {
  card: (typeof CARDS)[number];
  className?: string;
  style?: CSSProperties;
  responsive?: boolean;
}) {
  if (card.kind === "chantiers") {
    return (
      <HeroCardShell nodeId={card.nodeId} label={card.label} style={style} className={className}>
        <HeroChantiersCard className={responsive ? "w-full min-w-0 max-w-none" : undefined} />
      </HeroCardShell>
    );
  }
  return <HeroCardImage card={card} className={className} style={style} responsive={responsive} />;
}

/** Quatre cartes hero — frame `235:33491` alignée sur Figma (bas de ligne commun). */
export function HeroFeatureCards({ className }: { className?: string }) {
  return (
    <>
      <div
        className={cn(
          "mx-auto grid w-full min-w-0 max-w-[1240px] grid-cols-1 gap-4 px-4 pb-10",
          "md:grid-cols-2 md:gap-4 md:px-5",
          "lg:hidden",
          className,
        )}
      >
        {CARDS.map((card) => (
          <HeroCard key={card.nodeId} card={card} className="min-w-0 w-full" responsive />
        ))}
      </div>

      <div
        data-node-id="235:33491"
        className="pointer-events-none absolute left-[130px] top-[508px] z-[25] hidden h-[331px] w-[1182px] max-w-[calc(100%-260px)] lg:pointer-events-auto lg:block"
      >
        {CARDS.map((card) => (
          <HeroCard
            key={card.nodeId}
            card={card}
            className="absolute"
            style={{
              left: card.x,
              top: card.y,
              width: card.width,
              height: card.height,
            }}
          />
        ))}
      </div>
    </>
  );
}

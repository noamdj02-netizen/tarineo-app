"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

import { LandingHeroOrangeBackdrop } from "@/components/site/landing-v2/components/ui/LandingHeroOrangeBackdrop";

const ASSET = "/illustrations/landing-hero-24";

/**
 * Figma « Frame 2147207272 » — node 183:3886
 * Positions absolues natives (canvas téléphone 1470×1448).
 * Fond derrière le téléphone : mouvement doux (gradient + texture + glows).
 */
export function HeroPhonePanel({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();

  return (
    <div
      className={`relative mx-auto h-[min(380px,78vw)] w-full max-w-[420px] overflow-hidden rounded-bl-[24px] rounded-br-[24px] border-b-[3px] border-l-[3px] border-r-[3px] border-white bg-gradient-to-b from-[#faad98] to-[#f7562c] to-[66.507%] shadow-[0px_12px_32px_0px_rgba(0,0,0,0.08)] sm:h-[min(520px,70vw)] sm:max-w-[520px] sm:rounded-bl-[28px] sm:rounded-br-[28px] lg:mx-0 lg:h-[691px] lg:max-w-[681px] lg:rounded-bl-[30px] lg:rounded-br-[30px] ${className}`}
      data-node-id="183:3886"
      data-name="Frame 2147207272"
    >
      <LandingHeroOrangeBackdrop />

      {/* Canvas téléphone — 183:3888 (scale mobile pour cadrer dans le panneau réduit) */}
      <div
        className="absolute left-[calc(50%-32.84px)] top-[calc(50%+203.68px)] h-[1448.34px] w-[1470.647px] -translate-x-1/2 -translate-y-1/2 scale-[0.58] overflow-clip sm:scale-[0.78] lg:scale-100"
        data-node-id="183:3888"
      >
        <GlowVector
          className="left-[597.44px] top-[256.78px]"
          src={`${ASSET}/vector-11.svg`}
          w={367}
          h={421}
          reduce={!!reduce}
          delay={0}
        />
        <GlowVector
          className="left-[597.44px] top-[256.78px]"
          src={`${ASSET}/vector-12.svg`}
          w={373}
          h={427}
          reduce={!!reduce}
          delay={0.4}
        />
        <GlowVector
          className="left-[597.44px] top-[256.78px] mix-blend-plus-lighter"
          src={`${ASSET}/vector-13.svg`}
          w={401}
          h={455}
          reduce={!!reduce}
          delay={0.8}
        />
        <GlowVector
          className="left-[604.6px] top-[276.98px] mix-blend-plus-lighter"
          src={`${ASSET}/vector-15.svg`}
          w={437}
          h={491}
          reduce={!!reduce}
          delay={1.2}
        />

        {/* Color plate — 187:3927 */}
        <div
          className="absolute left-[calc(50%+16.36px)] top-[calc(50%-118.92px)] h-[823.517px] w-[1464.03px] -translate-x-1/2 -translate-y-1/2 opacity-[0.92]"
          data-node-id="187:3927"
        >
          <Image
            src={`${ASSET}/phone-color.png`}
            alt=""
            fill
            className="object-cover"
            sizes="1464px"
            priority
          />
        </div>

        {/* Screen masked — 187:3930 */}
        <div
          className="absolute left-[485.23px] top-[269.5px] h-[685.016px] w-[494.905px]"
          data-node-id="187:3930"
          style={{
            WebkitMaskImage: `url(${ASSET}/phone-mask.png)`,
            maskImage: `url(${ASSET}/phone-mask.png)`,
            WebkitMaskSize: "1464.031px 823.517px",
            maskSize: "1464.031px 823.517px",
            WebkitMaskPosition: "-465.566px -75.644px",
            maskPosition: "-465.566px -75.644px",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${ASSET}/phone-screen.png`}
            alt="Aperçu application TARINEO"
            width={495}
            height={685}
            className="block size-full max-w-none"
          />
        </div>

        {/* Display frame — 187:3931 */}
        <div
          className="absolute left-[19.66px] top-[193.88px] h-[823.517px] w-[1464.03px]"
          data-node-id="187:3931"
        >
          <Image
            src={`${ASSET}/phone-frame.png`}
            alt=""
            fill
            className="pointer-events-none object-cover"
            sizes="1464px"
            priority
          />
        </div>
      </div>

      {/* Fondu bas — desktop uniquement (sur mobile il masquait l’écran du téléphone). */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-3px] left-1/2 hidden h-[200px] w-full max-w-[740px] -translate-x-1/2 bg-gradient-to-b from-transparent to-paper-100 lg:block lg:h-[289px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-3px] left-1/2 hidden h-16 w-full max-w-[740px] -translate-x-1/2 bg-gradient-to-b from-transparent to-paper-100 blur-[14px] lg:block lg:h-[77px]"
      />
    </div>
  );
}

function GlowVector({
  className,
  src,
  w,
  h,
  reduce,
  delay,
}: {
  className: string;
  src: string;
  w: number;
  h: number;
  reduce: boolean;
  delay: number;
}) {
  return (
    <motion.div
      className={`absolute flex h-[438.815px] w-[387.675px] items-center justify-center ${className}`}
      animate={
        reduce
          ? undefined
          : {
              opacity: [0.55, 0.95, 0.55],
              scale: [1, 1.04, 1],
            }
      }
      transition={
        reduce
          ? undefined
          : {
              duration: 5.5,
              ease: "easeInOut",
              repeat: Infinity,
              delay,
            }
      }
    >
      <div className="h-[419.438px] w-[365.248px] -rotate-[3.14deg]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" width={w} height={h} className="size-full max-w-none" />
      </div>
    </motion.div>
  );
}

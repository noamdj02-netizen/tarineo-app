"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

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
      {/* Base gradient — respirations de teinte */}
      {!reduce ? (
        <>
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#ffc4b0] via-[#f7562c] to-[#e8451f]"
            animate={{ opacity: [0.35, 0.75, 0.35] }}
            transition={{ duration: 7, ease: "easeInOut", repeat: Infinity }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -left-1/4 top-[-20%] h-[70%] w-[150%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.35)_0%,transparent_65%)]"
            animate={{ x: ["-8%", "12%", "-8%"], y: ["0%", "10%", "0%"], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 9, ease: "easeInOut", repeat: Infinity }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -right-1/4 bottom-[10%] h-[55%] w-[120%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,140,80,0.55)_0%,transparent_70%)]"
            animate={{ x: ["10%", "-14%", "10%"], y: ["8%", "-6%", "8%"], opacity: [0.45, 0.8, 0.45] }}
            transition={{ duration: 11, ease: "easeInOut", repeat: Infinity }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute left-[-3px] top-[-80px] h-[851px] w-[681px] bg-gradient-to-b from-[#faad98]/80 to-transparent"
            data-node-id="188:489"
            animate={{ y: [-36, 48, -36], opacity: [0.25, 0.55, 0.25] }}
            transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }}
          />
        </>
      ) : null}

      {/* Texture — dérive lente */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-[calc(50%+0.28px)] top-[-9.52px] h-[709.086px] w-[997.152px] -translate-x-1/2 bg-left-top bg-repeat opacity-90"
        style={{
          backgroundImage: `url(${ASSET}/orange-texture.png)`,
          backgroundSize: "600px 600px",
        }}
        data-node-id="183:3887"
        animate={
          reduce
            ? undefined
            : {
                backgroundPosition: ["0px 0px", "48px 32px", "0px 0px"],
                scale: [1, 1.04, 1],
              }
        }
        transition={
          reduce
            ? undefined
            : { duration: 18, ease: "linear", repeat: Infinity }
        }
      />

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

      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-3px] left-1/2 h-[289.904px] w-[740.344px] -translate-x-1/2 bg-gradient-to-b from-transparent to-white"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-3px] left-1/2 h-[76.927px] w-[740.344px] -translate-x-1/2 bg-gradient-to-b from-transparent to-white blur-[14px]"
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

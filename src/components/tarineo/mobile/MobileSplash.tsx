"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { MOBILE_BG } from "./mobileTokens";

export function MobileSplash() {
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const standalone =
      typeof window !== "undefined" &&
      (window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as Navigator & { standalone?: boolean }).standalone === true);
    const dejaVu = sessionStorage.getItem("tarineo-splash-vu");
    if (!standalone && dejaVu) return;

    setVisible(true);
    const duree = standalone ? 1400 : 900;
    const timer = window.setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem("tarineo-splash-vu", "1");
    }, duree);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-4 lg:hidden"
      style={{ backgroundColor: MOBILE_BG }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduce ? 0 : 0.35 }}
      aria-hidden
    >
      <motion.div
        initial={reduce ? false : { scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <Image src="/landing/logo-mark.png" alt="" width={72} height={72} priority className="size-[72px]" />
      </motion.div>
      <motion.p
        className="text-sm font-semibold tracking-wide text-[#171717]"
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        Tarineo
      </motion.p>
    </motion.div>
  );
}

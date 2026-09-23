"use client";

import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { usePathname, useSearchParams } from "next/navigation";
import { appEase, appSpring, appSpringSoft } from "./appMotionConfig";
import { AppStagger, AppStaggerItem } from "./AppStagger";
import { useAppNavigation, type TransitionNavigation } from "./AppNavigationContext";

function staggerSections(nodes: ReactNode[]): ReactNode {
  if (nodes.length <= 1) return nodes[0] ?? null;
  return (
    <AppStagger className="flex w-full min-w-0 flex-col gap-[inherit]" stagger={0.045} delayChildren={0.02}>
      {nodes.map((node, i) => (
        <AppStaggerItem key={i}>{node}</AppStaggerItem>
      ))}
    </AppStagger>
  );
}

function withAutoStagger(children: ReactNode): ReactNode {
  const items = Children.toArray(children);

  if (items.length === 1 && isValidElement(items[0])) {
    const el = items[0] as ReactElement<{ children?: ReactNode; className?: string }>;
    const tag = el.type;
    if (tag === "div" || tag === "section" || tag === "main") {
      const inner = Children.toArray(el.props.children);
      if (inner.length > 1) {
        return cloneElement(el, { children: staggerSections(inner) });
      }
    }
  }

  if (items.length > 1) {
    return staggerSections(items);
  }

  return children;
}

const VARIANTS: Record<
  TransitionNavigation,
  { initial: Record<string, number>; animate: Record<string, number>; transition: object }
> = {
  // opacity toujours à 1 : page jamais invisible si l'anim est interrompue.
  default: {
    initial: { opacity: 1, y: 10, x: 0 },
    animate: { opacity: 1, y: 0, x: 0 },
    transition: { ...appSpringSoft, ease: appEase },
  },
  import: {
    initial: { opacity: 1, y: 28, scale: 0.98, x: 0 },
    animate: { opacity: 1, y: 0, scale: 1, x: 0 },
    transition: { ...appSpring, ease: appEase },
  },
  "tab-right": {
    initial: { opacity: 1, x: 36, y: 0 },
    animate: { opacity: 1, x: 0, y: 0 },
    transition: { type: "spring", stiffness: 320, damping: 34, mass: 0.75 },
  },
  "tab-left": {
    initial: { opacity: 1, x: -36, y: 0 },
    animate: { opacity: 1, x: 0, y: 0 },
    transition: { type: "spring", stiffness: 320, damping: 34, mass: 0.75 },
  },
};

export function AppPageEnter({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const reduce = useReducedMotion();
  const { consommerTransition, transition } = useAppNavigation();

  const scannerActif = searchParams.get("scanner") === "1";
  const typeTransition: TransitionNavigation =
    transition !== "default" ? transition : scannerActif ? "import" : "default";

  const variante = VARIANTS[typeTransition];
  const contenu = withAutoStagger(children);
  const pageKey = scannerActif ? `${pathname}?scanner=1` : pathname;

  function apresAnimation() {
    if (typeTransition !== "default") {
      consommerTransition();
    }
  }

  if (reduce) {
    return <>{children}</>;
  }

  return (
    <motion.div
      key={pageKey}
      initial={variante.initial}
      animate={variante.animate}
      transition={variante.transition}
      onAnimationComplete={apresAnimation}
      className="min-w-0"
    >
      {contenu}
    </motion.div>
  );
}

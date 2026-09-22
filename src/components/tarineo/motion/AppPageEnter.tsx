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
    <AppStagger className="contents" stagger={0.045} delayChildren={0.02}>
      {nodes.map((node, i) => (
        <AppStaggerItem key={i} className="contents">
          {node}
        </AppStaggerItem>
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
  default: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { ...appSpringSoft, ease: appEase },
  },
  import: {
    initial: { opacity: 0, y: 36, scale: 0.97 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { ...appSpring, ease: appEase },
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
    >
      {contenu}
    </motion.div>
  );
}

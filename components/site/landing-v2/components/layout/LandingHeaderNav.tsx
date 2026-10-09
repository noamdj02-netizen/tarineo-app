"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { landingNavPrimary } from "@/lib/site/landing-v2-content";
import { isBlogRoute, landingNavHref } from "@/lib/site/landing-nav";
import { cn } from "@/lib/utils";

const anchorNavItems = landingNavPrimary.filter((item) => item.href.startsWith("#"));
const sectionIds = anchorNavItems
  .map((item) => item.href.replace(/^#/, ""))
  .filter((id) => id.length > 0);

export function LandingHeaderNav() {
  const pathname = usePathname();
  const [activeHash, setActiveHash] = useState("");
  const onHome = pathname === "/";

  useEffect(() => {
    if (!onHome) return;
    const syncHash = () => setActiveHash(window.location.hash);
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [onHome]);

  useEffect(() => {
    if (!onHome) return;

    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        const top = visible[0];
        if (top?.target.id) {
          setActiveHash(`#${top.target.id}`);
        }
      },
      {
        rootMargin: "-40% 0px -45% 0px",
        threshold: [0.08, 0.2, 0.35],
      },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [onHome]);

  return (
    <nav aria-label="Sections de la page" className="landing-header-nav">
      {landingNavPrimary.map((item) => {
        const resolved = landingNavHref(item.href, pathname);
        const isAnchor = item.href.startsWith("#");
        const active =
          (isAnchor && onHome && activeHash === item.href) ||
          (item.href === "/blog" && isBlogRoute(pathname));

        return (
          <a
            key={`${item.href}-${item.label}`}
            href={resolved}
            data-active={active ? "true" : undefined}
            className={cn("landing-header-nav-link", active && "is-active")}
          >
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}

"use client";

import { useEffect, useState } from "react";

import { landingNavPrimary } from "@/lib/site/landing-v2-content";

const anchorNavItems = landingNavPrimary.filter((item) => item.href.startsWith("#"));
const sectionIds = anchorNavItems
  .map((item) => item.href.replace(/^#/, ""))
  .filter((id) => id.length > 0);

export function LandingHeaderNav() {
  const [activeHash, setActiveHash] = useState("");

  useEffect(() => {
    const syncHash = () => setActiveHash(window.location.hash);
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  useEffect(() => {
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
        rootMargin: "-42% 0px -48% 0px",
        threshold: [0.08, 0.2, 0.35],
      },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <nav aria-label="Sections de la page" className="landing-header-nav">
      {landingNavPrimary.map((item) => {
        const isAnchor = item.href.startsWith("#");
        const active = isAnchor && activeHash === item.href;
        return (
          <a
            key={`${item.href}-${item.label}`}
            href={item.href}
            data-active={active ? "true" : undefined}
            className="landing-header-nav-link"
          >
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}

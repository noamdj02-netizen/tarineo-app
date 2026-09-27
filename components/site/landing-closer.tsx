"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { BRAND } from "@/lib/brand";
import { PRO_TRIAL_DAYS } from "@/lib/billing/plans";

const FILM =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260826_123836_11a3c5e0-713f-4bef-a8e9-7dd93bdea3b0.mp4";
const POSTER =
  "https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/693205bf-8048-456a-879e-4e0a1b85a098.webp";

const COLS = [
  {
    title: "Produit",
    links: [
      { href: "/#solution", label: "Solution" },
      { href: "/#fonctions", label: "Fonctions" },
      { href: "/prix", label: "Prix" },
      { href: "/avis", label: "Avis" },
      { href: "/#faq", label: "FAQ" },
    ],
  },
  {
    title: "Parcours",
    links: [
      { href: "/#comment", label: "Comment ça marche" },
      { href: "/#film", label: "Téléphone" },
      { href: "/#temoignages", label: "Témoignages" },
    ],
  },
  {
    title: "Compte",
    links: [
      { href: "/inscription", label: "Créer un compte" },
      { href: "/login", label: "Connexion" },
      { href: "/confidentialite", label: "Confidentialité" },
    ],
  },
] as const;

const EXPO = "cubic-bezier(.16,1,.3,1)";
const SOFT = "cubic-bezier(.22,.65,.28,1)";
const SETTLE = "cubic-bezier(.33,1,.68,1)";

/** Closer accueil : film alpin + hero à gauche + footer verre. */
export function LandingCloser() {
  const root = useRef<HTMLElement>(null);
  const year = new Date().getFullYear();

  useEffect(() => {
    const el = root.current;
    if (!el || el.dataset.entered === "1") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.classList.add("is-enter");
    const narrow = window.matchMedia("(max-width: 648px)").matches;
    const d = narrow ? 0.62 : 1;
    const t = narrow ? 0.85 : 1;
    const rise = (node: Element | null, y: number, duration: number, delay: number, ease: string) => {
      if (!(node instanceof HTMLElement)) return;
      node.animate(
        [
          { opacity: 0, transform: `translate3d(0,${y}px,0)` },
          { opacity: 1, transform: "translate3d(0,0,0)" },
        ],
        { duration, delay, easing: ease, fill: "forwards" },
      );
    };
    rise(el.querySelector(".landing-closer-eyebrow"), 12 * d, 560, 60 * t, SOFT);
    const headline = el.querySelector(".landing-closer-headline");
    if (headline instanceof HTMLElement) {
      headline.animate(
        [
          { transform: "translate3d(0,118%,0)" },
          { transform: "translate3d(0,0,0)" },
        ],
        { duration: 950, delay: 170 * t, easing: EXPO, fill: "forwards" },
      );
    }
    rise(el.querySelector(".landing-closer-lede"), 14 * d, 660, 430 * t, SOFT);
    const cta = el.querySelector(".landing-closer-cta");
    if (cta instanceof HTMLElement) {
      cta.animate(
        [
          { opacity: 0, transform: `translate3d(0,${12 * d}px,0) scale(.985)` },
          { opacity: 1, transform: "none" },
        ],
        { duration: 580, delay: 620 * t, easing: SETTLE, fill: "forwards" },
      );
    }
    rise(el.querySelector(".landing-closer-brand"), 10 * d, 540, 600 * t, SOFT);
    rise(el.querySelector(".landing-closer-tag"), 10 * d, 540, 670 * t, SOFT);
    el.querySelectorAll(".landing-closer-col").forEach((col, i) => {
      rise(col, 14 * d, 580, (720 + i * 70) * t, SOFT);
    });
    const rule = el.querySelector(".landing-closer-rule");
    if (rule instanceof HTMLElement) {
      rule.animate(
        [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }],
        { duration: 720, delay: 980 * t, easing: EXPO, fill: "forwards" },
      );
    }
    rise(el.querySelector(".landing-closer-legal"), 8 * d, 500, 1120 * t, SOFT);
    const done = window.setTimeout(() => {
      el.classList.remove("is-enter");
      el.dataset.entered = "1";
    }, 1900 * t);
    return () => window.clearTimeout(done);
  }, []);

  return (
    <section ref={root} className="landing-closer" aria-labelledby="closer-title">
      <div className="landing-closer-bg" aria-hidden>
        <img src={POSTER} alt="" className="landing-closer-poster" />
        <video
          src={FILM}
          poster={POSTER}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label="Painted alpine panorama: a lone hiker with a pink backpack faces a snow-capped peak above a sea of clouds"
        />
      </div>
      <div className="landing-closer-scrim" aria-hidden />

      <div className="landing-closer-stage">
        <p className="landing-closer-eyebrow">Prêt quand tu l’es</p>
        <div className="landing-closer-mask">
          <h2 id="closer-title" className="landing-closer-headline">
            Lance ton prochain projet.
          </h2>
        </div>
        <p className="landing-closer-lede">
          {PRO_TRIAL_DAYS} jours d’essai Pro sans carte. Crée ton compte, ajoute tes projets et
          choisis ton Focus.
        </p>
        <Link href="/inscription?plan=pro" className="landing-closer-cta">
          <span>Commencer l’essai</span>
        </Link>
      </div>

      <footer className="landing-closer-foot">
        <div className="landing-closer-finner">
          <div className="landing-closer-top">
            <div className="landing-closer-brand">
              <span className="landing-closer-word">{BRAND.name}</span>
              <p className="landing-closer-tag">
                Le cockpit des fondateurs solo. Un projet en Focus, la prochaine action.
              </p>
            </div>
            <nav className="landing-closer-nav" aria-label="Pied de page">
              {COLS.map((col) => (
                <div key={col.title} className="landing-closer-col">
                  <h3>{col.title}</h3>
                  <ul>
                    {col.links.map((l) => (
                      <li key={l.href}>
                        <Link href={l.href}>{l.label}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
          <div className="landing-closer-rule" aria-hidden />
          <div className="landing-closer-footrow">
            <p className="landing-closer-legal">
              © {year} {BRAND.name} · Fait en France ·{" "}
              <a href="mailto:contact@navpit.com">contact@navpit.com</a>
            </p>
          </div>
        </div>
      </footer>
    </section>
  );
}

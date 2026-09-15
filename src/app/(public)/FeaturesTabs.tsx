"use client";

import { useEffect, useState } from "react";
import type { Feature } from "@/lib/features";
import { NOM_EVENEMENT_OUVRIR_FONCTIONNALITE, CLE_SESSION_ONGLET_FONCTIONNALITE } from "@/lib/features";

const DUREE_AUTOPLAY_MS = 4500;
const DELAI_REPRISE_MS = 8000;

// Sélecteur d'onglets pour la section "Ce que vous gagnez" : un seul panneau de
// détail affiché à la fois (plutôt que 6 cartes empilées) pour réduire drastiquement
// la hauteur de scroll, surtout sur mobile. La liste d'onglets défile horizontalement
// sur petit écran (scrollbar-none masque la barre, le contenu reste accessible au
// swipe/scroll tactile).
//
// Showcase auto-rotatif façon stories : l'onglet actif avance tout seul toutes les
// DUREE_AUTOPLAY_MS, en boucle. Un clic manuel met en pause (l'utilisateur vient de
// choisir quoi regarder, on ne le lui arrache pas) — la rotation reprend depuis
// l'onglet courant après DELAI_REPRISE_MS d'inactivité. Désactivée si l'utilisateur
// préfère un mouvement réduit : navigation manuelle uniquement, aucune surprise.
export function FeaturesTabs({ features }: { features: Feature[] }) {
  const [actif, setActif] = useState(0);
  const [enPause, setEnPause] = useState(false);
  const [motionReduite, setMotionReduite] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const requete = window.matchMedia("(prefers-reduced-motion: reduce)");
    const ecouter = (e: MediaQueryListEvent) => setMotionReduite(e.matches);
    requete.addEventListener("change", ecouter);
    return () => requete.removeEventListener("change", ecouter);
  }, []);

  // Sélection d'un onglet depuis le mega-menu "Fonctionnalités" du header (LandingNav) :
  // sessionStorage couvre le cas d'une navigation complète depuis une autre page (le
  // composant vient de monter), l'événement DOM couvre le cas où on est déjà sur la
  // landing page (pas de remontage, sessionStorage ne serait relu qu'au prochain mount).
  useEffect(() => {
    function selectionnerParSlug(slug: string | null) {
      if (!slug) return;
      const index = features.findIndex((f) => f.slug === slug);
      if (index >= 0) {
        setActif(index);
        setEnPause(true);
      }
    }

    try {
      const slugInitial = sessionStorage.getItem(CLE_SESSION_ONGLET_FONCTIONNALITE);
      if (slugInitial) {
        sessionStorage.removeItem(CLE_SESSION_ONGLET_FONCTIONNALITE);
        selectionnerParSlug(slugInitial);
      }
    } catch {
      // sessionStorage indisponible (navigation privée stricte) : l'écouteur d'événement
      // ci-dessous suffit tant qu'on est déjà sur la landing page.
    }

    function ecouterSelection(e: Event) {
      selectionnerParSlug((e as CustomEvent<string>).detail);
    }
    window.addEventListener(NOM_EVENEMENT_OUVRIR_FONCTIONNALITE, ecouterSelection);
    return () => window.removeEventListener(NOM_EVENEMENT_OUVRIR_FONCTIONNALITE, ecouterSelection);
  }, [features]);

  useEffect(() => {
    if (enPause || motionReduite) return;
    const id = setTimeout(() => {
      setActif((a) => (a + 1) % features.length);
    }, DUREE_AUTOPLAY_MS);
    return () => clearTimeout(id);
  }, [actif, enPause, motionReduite, features.length]);

  useEffect(() => {
    if (!enPause) return;
    const id = setTimeout(() => setEnPause(false), DELAI_REPRISE_MS);
    return () => clearTimeout(id);
  }, [enPause, actif]);

  const enLecture = !enPause && !motionReduite;

  return (
    <div className="mt-10">
      <div
        role="tablist"
        aria-label="Fonctionnalités Tarineo"
        className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-3"
      >
        {features.map((f, i) => {
          const selectionne = i === actif;
          return (
            <div key={f.tag} className="relative shrink-0">
              <button
                type="button"
                role="tab"
                aria-selected={selectionne}
                onClick={() => {
                  setActif(i);
                  setEnPause(true);
                }}
                className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  selectionne
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border bg-background text-muted hover:border-accent/50 hover:text-foreground"
                }`}
              >
                {f.tag}
                {f.bientotDisponible && (
                  <span
                    aria-hidden="true"
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                      selectionne ? "bg-accent-foreground" : "bg-accent"
                    }`}
                  />
                )}
              </button>
              {selectionne && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-3 -bottom-2 h-[3px] overflow-hidden rounded-full bg-border"
                >
                  {enLecture && (
                    <span
                      key={actif}
                      className="features-tab-progress-fill block h-full rounded-full bg-accent"
                      style={{ animationDuration: `${DUREE_AUTOPLAY_MS}ms` }}
                    />
                  )}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Les 7 panneaux restent tous montés en permanence, superposés dans la même
          cellule de grille (col-start-1 row-start-1) : seuls texte/highlight changent
          de longueur d'un onglet à l'autre, et la rotation automatique tournant en
          continu (DUREE_AUTOPLAY_MS), un panneau démonté/remonté à chaque bascule
          ferait varier la hauteur de la grille au fil du contenu affiché — poussant
          Tarifs/CTA/footer vers le haut ou le bas toutes les 4,5s sans aucune action de
          l'utilisateur. En gardant les 7 hauteurs réelles présentes dans le flux (les
          panneaux masqués restent en `invisible`, jamais en `hidden`/`display:none`, qui
          les retirerait du calcul de hauteur), la grille se dimensionne une fois pour
          toutes sur le plus grand panneau et ne bouge plus au changement d'onglet. */}
      <div className="relative mt-5 grid">
        {features.map((f, i) => {
          const selectionne = i === actif;
          return (
            <div
              // Remonte uniquement le panneau qui devient actif (clé différente de son
              // état précédent) pour rejouer l'animation d'entrée — sans démonter les
              // panneaux inactifs, qui doivent rester dans le flux pour leur hauteur.
              key={selectionne ? `actif-${actif}` : `inactif-${i}`}
              role="tabpanel"
              aria-hidden={!selectionne}
              className={`features-tab-panel col-start-1 row-start-1 rounded-xl border border-border bg-background p-7 ${
                selectionne ? "" : "invisible pointer-events-none"
              }`}
            >
              <span className="mb-4 inline-block rounded border border-accent/25 bg-accent/10 px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-wider text-accent">
                {f.tag}
              </span>
              <p className="mb-2.5 flex flex-wrap items-center gap-2 text-lg font-bold text-white">
                {f.titre}
                {f.bientotDisponible && (
                  <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-muted">
                    Bientôt disponible
                  </span>
                )}
              </p>
              <p className="text-sm leading-relaxed text-muted">{f.texte}</p>
              <div className="mt-4 rounded-r-md border-l-2 border-green-500 bg-green-500/10 p-3 text-sm italic text-green-300">
                {f.highlight}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

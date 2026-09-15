"use client";

import { useState } from "react";

type Contenu = "legal" | "privacy" | null;

// Rend à la fois les liens du footer et la modale : les deux doivent partager le même
// état d'ouverture, donc les deux vivent dans le même Client Component plutôt que
// d'essayer de faire communiquer un déclencheur server-rendered avec une modale cliente.
export function LegalFooterLinks() {
  const [ouvert, setOuvert] = useState<Contenu>(null);

  return (
    <>
      <span className="text-xs text-muted">
        <button type="button" onClick={() => setOuvert("legal")} className="underline decoration-dotted underline-offset-2 hover:text-accent">
          Mentions légales
        </button>
        {" · "}
        <button type="button" onClick={() => setOuvert("privacy")} className="underline decoration-dotted underline-offset-2 hover:text-accent">
          Politique de confidentialité
        </button>
        {" · "}
        contact@tarineo.com
      </span>

      {ouvert && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setOuvert(null);
          }}
          className="fixed inset-0 z-[200] overflow-y-auto bg-black/70 px-6 py-16"
        >
          <div className="relative mx-auto max-w-xl rounded-2xl border border-border bg-surface p-8">
            <button
              type="button"
              onClick={() => setOuvert(null)}
              aria-label="Fermer"
              className="absolute right-4 top-4 text-xl text-muted hover:text-foreground"
            >
              ✕
            </button>

            {ouvert === "legal" && (
              <div className="space-y-4 text-sm leading-relaxed text-muted">
                <h3 className="text-xl font-bold text-white">Mentions légales</h3>
                <p>
                  <strong className="text-foreground">Éditeur du site</strong>
                  <br />
                  Ce site est édité à titre non professionnel par un particulier, conformément à l&apos;article
                  6-III-2 de la loi n°2004-575 du 21 juin 2004 (LCEN). L&apos;éditeur a transmis ses éléments
                  d&apos;identification personnelle à l&apos;hébergeur ci-dessous.
                  <br />
                  Contact : contact@tarineo.com
                </p>
                <p>
                  <strong className="text-foreground">Hébergement</strong>
                  <br />
                  Vercel Inc.
                  <br />
                  340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis
                  <br />
                  vercel.com
                </p>
                <p>
                  <strong className="text-foreground">Propriété intellectuelle</strong>
                  <br />
                  L&apos;ensemble du contenu de ce site (textes, visuels, logo) est la propriété exclusive de
                  son éditeur. Toute reproduction sans autorisation est interdite.
                </p>
                <p>
                  <strong className="text-foreground">Marques citées</strong>
                  <br />
                  Les marques et enseignes citées sur ce site (Cedeo, Point P, Rexel, Brossette, Richardson,
                  Aubade, etc.) appartiennent à leurs propriétaires respectifs. Elles sont mentionnées
                  uniquement pour indiquer la compatibilité du service avec les documents émis par ces
                  enseignes. Tarineo est un service indépendant, sans aucune affiliation, partenariat ni
                  approbation de ces entreprises. Les chiffres et exemples présentés sur ce site sont fictifs
                  et fournis à titre illustratif.
                </p>
                <p>
                  <strong className="text-foreground">Facturation électronique</strong>
                  <br />
                  Tarineo n&apos;est pas une Plateforme Agréée (PA) au sens de la réforme de la facturation
                  électronique, et ne prétend pas l&apos;être. Le service se prépare à cette réforme et est conçu
                  pour rester complémentaire à la PA que vous utiliserez pour émettre et recevoir vos factures.
                </p>
              </div>
            )}

            {ouvert === "privacy" && (
              <div className="space-y-4 text-sm leading-relaxed text-muted">
                <h3 className="text-xl font-bold text-white">Politique de confidentialité</h3>
                <p>
                  <strong className="text-foreground">Données collectées</strong>
                  <br />
                  Lors de la création d&apos;un compte, ce site collecte votre adresse email et le mot de passe
                  associé (stocké sous forme hachée, jamais en clair). Si vous utilisez la connexion Google,
                  seules les informations de profil nécessaires (email, nom) sont récupérées.
                </p>
                <p>
                  <strong className="text-foreground">Finalité</strong>
                  <br />
                  Ces données sont utilisées exclusivement pour la création et la gestion de votre compte
                  Tarineo, et pour vous permettre d&apos;utiliser le service. Elles ne sont ni vendues, ni
                  partagées avec des tiers à des fins commerciales.
                </p>
                <p>
                  <strong className="text-foreground">Durée de conservation</strong>
                  <br />
                  Vos données sont conservées tant que votre compte est actif, ou jusqu&apos;à votre demande de
                  suppression depuis la page Mon compte.
                </p>
                <p>
                  <strong className="text-foreground">Vos droits</strong>
                  <br />
                  Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification et de
                  suppression de vos données — directement depuis votre compte, ou en écrivant à
                  contact@tarineo.com. Vous pouvez également introduire une réclamation auprès de la CNIL
                  (www.cnil.fr).
                </p>
                <p>
                  <strong className="text-foreground">Cookies</strong>
                  <br />
                  Ce site n&apos;utilise actuellement aucun cookie ni traceur publicitaire, hormis le cookie de
                  session strictement nécessaire pour rester connecté.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

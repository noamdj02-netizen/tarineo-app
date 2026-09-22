"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Building2Icon, SearchIcon, StoreIcon, TruckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Resultat = {
  nom: string;
  slug: string;
  metiers: string;
  logoUrl: string | null;
  source: string;
  dejaPresent: boolean;
};

const ETAPES_CHARGEMENT = [
  "Recherche de l'enseigne…",
  "Récupération du logo…",
  "Ajout à votre bibliothèque…",
];

export function RechercheFournisseurIA() {
  const [requete, setRequete] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [etapeChargement, setEtapeChargement] = useState(0);
  const [erreur, setErreur] = useState<string | null>(null);
  const [resultat, setResultat] = useState<Resultat | null>(null);

  async function rechercher(e?: React.FormEvent) {
    e?.preventDefault();
    const q = requete.trim();
    if (q.length < 2 || enCours) return;

    setEnCours(true);
    setErreur(null);
    setResultat(null);
    setEtapeChargement(0);

    const timer = window.setInterval(() => {
      setEtapeChargement((n) => (n < ETAPES_CHARGEMENT.length - 1 ? n + 1 : n));
    }, 900);

    try {
      const res = await fetch("/api/fournisseurs/rechercher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requete: q }),
      });
      const data = (await res.json()) as Resultat & { erreur?: string };
      if (!res.ok) {
        setErreur(data.erreur ?? "Recherche impossible, réessayez.");
        return;
      }
      setResultat(data);
    } catch {
      setErreur("Connexion impossible. Vérifiez votre réseau.");
    } finally {
      window.clearInterval(timer);
      setEnCours(false);
    }
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Tapez le nom d&apos;une enseigne — Cedeo, Conforama, Gedimat… Tarineo retrouve le logo et l&apos;ajoute à
        votre bibliothèque pour importer un devis.
      </p>

      <form onSubmit={rechercher} className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={requete}
            onChange={(e) => setRequete(e.target.value)}
            placeholder="Ex. Conforama, Gedimat, Bricoman…"
            className="h-12 w-full rounded-full border border-[#E6E9EB] bg-white pl-11 pr-4 text-sm outline-none focus:border-primary"
            disabled={enCours}
          />
        </div>
        <button
          type="submit"
          disabled={enCours || requete.trim().length < 2}
          className="inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50"
        >
          {enCours ? "Recherche…" : "Trouver"}
        </button>
      </form>

      {enCours && (
        <div className="overflow-hidden rounded-[20px] border border-[#FFE4D6] bg-gradient-to-br from-[#FFF8F5] to-[#FFF0E8] p-5">
          <div className="flex items-center gap-4">
            <div className="relative flex size-14 shrink-0 items-center justify-center">
              <Building2Icon className="fournisseur-icone-flotte absolute size-5 text-primary/70" style={{ "--delay": "0ms" } as React.CSSProperties} />
              <StoreIcon className="fournisseur-icone-flotte absolute size-5 text-primary" style={{ "--delay": "200ms" } as React.CSSProperties} />
              <TruckIcon className="fournisseur-icone-flotte absolute size-5 text-primary/80" style={{ "--delay": "400ms" } as React.CSSProperties} />
              <Image
                src="/landing/logo-icon.png"
                alt=""
                width={32}
                height={32}
                className="devis-ia-respire relative z-10 size-8"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">{ETAPES_CHARGEMENT[etapeChargement]}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                L&apos;IA identifie l&apos;enseigne et prépare votre fiche fournisseur.
              </p>
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-[var(--app-chart-track)]">
                <div className="devis-ia-balayage h-full w-1/4 rounded-full bg-primary" />
              </div>
            </div>
          </div>
        </div>
      )}

      {erreur && <p className="text-sm text-red-500">{erreur}</p>}

      {resultat && !enCours && (
        <div className="fournisseur-resultat-in rounded-[20px] border border-[#E6E9EB] bg-white p-5">
          <div className="flex items-start gap-4">
            {resultat.logoUrl ? (
              <Image
                src={resultat.logoUrl}
                alt=""
                width={56}
                height={56}
                className="size-14 rounded-xl object-cover"
                unoptimized
              />
            ) : (
              <span className="flex size-14 items-center justify-center rounded-xl bg-secondary text-xl font-bold text-primary">
                {resultat.nom.charAt(0)}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold text-foreground">{resultat.nom}</p>
              <p className="text-sm text-muted-foreground">{resultat.metiers}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {resultat.dejaPresent && resultat.source !== "ia"
                  ? "Déjà dans votre bibliothèque."
                  : "Ajouté à votre bibliothèque."}
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`/fournisseurs/${encodeURIComponent(resultat.slug)}`}
              className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-white hover:opacity-95"
            >
              Voir la fiche
            </Link>
            <Link
              href={`/documents?enseigne=${encodeURIComponent(resultat.nom)}`}
              className="inline-flex h-10 items-center justify-center rounded-full border border-[#E6E9EB] px-5 text-sm font-medium text-foreground hover:bg-[#F8F8F8]"
            >
              Importer un devis
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

type Onglet = "catalogue" | "trouver";

export function BibliothequeOnglets({
  catalogue,
  enseignesAjoutees,
}: {
  catalogue: React.ReactNode;
  enseignesAjoutees: { slug: string; nom: string; metiers: string | null; logoUrl: string | null }[];
}) {
  const [onglet, setOnglet] = useState<Onglet>("catalogue");

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Bibliothèque d&apos;enseignes</h2>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Catalogue courant ou recherche libre — toujours comparé à{" "}
            <strong className="font-medium text-foreground">votre</strong> historique, jamais à un prix public.
          </p>
        </div>
        <div className="flex rounded-full bg-secondary p-1">
          {(
            [
              { id: "catalogue" as const, label: "Catalogue" },
              { id: "trouver" as const, label: "Trouver +" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setOnglet(opt.id)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                onglet === opt.id ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {onglet === "trouver" ? (
        <div className="rounded-[20px] border border-[#E6E9EB] bg-white p-5 sm:p-6">
          <RechercheFournisseurIA />
        </div>
      ) : (
        <div className="space-y-5">
          {enseignesAjoutees.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold text-foreground">Ajoutées par vous</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {enseignesAjoutees.map((e) => (
                  <Link
                    key={e.slug}
                    href={`/fournisseurs/${encodeURIComponent(e.slug)}`}
                    className="flex items-center gap-3 rounded-[20px] border border-primary/20 bg-[#FFF8F5] p-4 transition-colors hover:border-primary/40"
                  >
                    {e.logoUrl ? (
                      <Image src={e.logoUrl} alt="" width={40} height={40} className="size-10 rounded-lg object-cover" unoptimized />
                    ) : (
                      <span className="flex size-10 items-center justify-center rounded-lg bg-secondary text-sm font-bold text-primary">
                        {e.nom.charAt(0)}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{e.nom}</p>
                      <p className="truncate text-xs text-muted-foreground">{e.metiers ?? "Fournisseur"}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {catalogue}
        </div>
      )}
    </section>
  );
}

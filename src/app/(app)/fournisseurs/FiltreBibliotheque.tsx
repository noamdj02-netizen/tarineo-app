"use client";

import { useMemo, useState } from "react";
import { BrandMark } from "@/components/tarineo/BrandMark";
import Link from "next/link";
import type { FournisseurBibliotheque } from "@/lib/fournisseursPage";

const formaterEuros = (v: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);

const GROUPES = ["Tous", "Saint-Gobain", "Kingfisher", "Adeo", "Martin Belaysoud", "Indépendants"] as const;

export function FiltreBibliotheque({ fournisseurs }: { fournisseurs: FournisseurBibliotheque[] }) {
  const [recherche, setRecherche] = useState("");
  const [groupe, setGroupe] = useState<string>("Tous");
  const [affichage, setAffichage] = useState<"tous" | "importes" | "catalogue">("tous");

  const filtres = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    return fournisseurs.filter((f) => {
      if (affichage === "importes" && !f.importe) return false;
      if (affichage === "catalogue" && f.importe) return false;
      if (groupe === "Indépendants" && f.groupe) return false;
      if (groupe !== "Tous" && groupe !== "Indépendants" && f.groupe !== groupe) return false;
      if (!q) return true;
      return (
        f.nom.toLowerCase().includes(q) ||
        (f.specialite?.toLowerCase().includes(q) ?? false) ||
        (f.groupe?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [fournisseurs, recherche, groupe, affichage]);

  const nbImportes = fournisseurs.filter((f) => f.importe).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Rechercher une enseigne, une spécialité…"
          className="h-11 w-full rounded-full border border-[#E6E9EB] bg-white px-4 text-sm outline-none focus:border-primary sm:max-w-md"
        />
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: "tous", label: `Toutes (${fournisseurs.length})` },
              { id: "importes", label: `Mes enseignes (${nbImportes})` },
              { id: "catalogue", label: `À découvrir (${fournisseurs.length - nbImportes})` },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setAffichage(opt.id)}
              className={`rounded-full px-4 py-2 text-sm transition-colors ${
                affichage === opt.id
                  ? "bg-primary text-white"
                  : "border border-[#E6E9EB] bg-white text-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {GROUPES.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGroupe(g)}
            className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
              groupe === g
                ? "bg-[#FFF0E8] font-medium text-primary"
                : "bg-[#F8F8F8] text-muted-foreground hover:text-foreground"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        {filtres.length === 0
          ? "Aucune enseigne ne correspond à votre recherche."
          : `${filtres.length} enseigne${filtres.length > 1 ? "s" : ""} affichée${filtres.length > 1 ? "s" : ""}`}
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {filtres.map((f) => (
          <Link
            key={f.slug}
            href={`/fournisseurs/${encodeURIComponent(f.slug)}`}
            className={`group flex flex-col items-center rounded-[20px] border p-4 text-center transition-shadow hover:shadow-md ${
              f.importe ? "border-[#E6E9EB] bg-white" : "border-dashed border-[#D8DCE0] bg-[#FAFBFC]"
            }`}
          >
            <BrandMark nom={f.nom} logo={f.logo} size={48} rounded="xl" />
            <p className="mt-3 line-clamp-2 text-sm font-medium text-foreground group-hover:text-primary">{f.nom}</p>
            {f.groupe && <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{f.groupe}</p>}
            {f.specialite && <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{f.specialite}</p>}

            {f.importe ? (
              <>
                <p className="mt-2 text-xs font-medium text-foreground">{formaterEuros(f.depenses)}</p>
                {f.hausses > 0 && (
                  <span className="mt-2 rounded-full bg-[#FFF0E8] px-2 py-0.5 text-[11px] font-medium text-primary">
                    {f.hausses} alerte{f.hausses > 1 ? "s" : ""}
                  </span>
                )}
              </>
            ) : (
              <span className="mt-2 rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[11px] text-muted-foreground">
                Pas encore importé
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

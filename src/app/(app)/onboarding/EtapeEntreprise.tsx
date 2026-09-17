"use client";

import { useState } from "react";
import { enregistrerEntrepriseOnboarding } from "./actions";

type Props = {
  email: string;
  telephoneInitial?: string;
  nomInitial?: string;
  onContinuer: () => void;
  onPasser: () => void;
};

export function EtapeEntreprise({ email, telephoneInitial, nomInitial, onContinuer, onPasser }: Props) {
  const [mode, setMode] = useState<"site" | "manuel">("site");
  const [siteUrl, setSiteUrl] = useState("");
  const [raisonSociale, setRaisonSociale] = useState(nomInitial ?? "");
  const [telephone, setTelephone] = useState(telephoneInitial ?? "");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoFichier, setLogoFichier] = useState<File | null>(null);
  const [apercuLogo, setApercuLogo] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function recupererDepuisSite() {
    setErreur(null);
    setChargement(true);
    try {
      const res = await fetch("/api/entreprise/depuis-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: siteUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErreur(data.erreur ?? "Impossible de récupérer le site.");
        return;
      }
      if (data.nom) setRaisonSociale(data.nom);
      if (data.logoUrl) {
        setLogoUrl(data.logoUrl);
        setApercuLogo(data.logoUrl);
        setLogoFichier(null);
      }
    } catch {
      setErreur("Erreur réseau. Réessayez ou saisissez à la main.");
    } finally {
      setChargement(false);
    }
  }

  function surLogoLocal(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setLogoFichier(f);
    setLogoUrl(null);
    setApercuLogo(URL.createObjectURL(f));
  }

  async function enregistrer(ignorer = false) {
    if (ignorer) {
      onPasser();
      return;
    }
    if (!raisonSociale.trim()) {
      setErreur("Indiquez au moins le nom de votre entreprise.");
      return;
    }
    setEnCours(true);
    setErreur(null);
    const formData = new FormData();
    formData.set("raisonSociale", raisonSociale.trim());
    formData.set("telephone", telephone.trim() || "—");
    formData.set("emailContact", email);
    if (logoUrl) formData.set("logoUrl", logoUrl);
    if (logoFichier) formData.set("logo", logoFichier);

    const resultat = await enregistrerEntrepriseOnboarding(formData);
    setEnCours(false);
    if (!resultat.succes) {
      setErreur(resultat.erreur);
      return;
    }
    onContinuer();
  }

  return (
    <div className="flex flex-col">
      <p className="text-sm font-medium uppercase tracking-wider text-primary">Votre entreprise</p>
      <h2 className="mt-3 text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
        Personnalisez vos devis.
      </h2>
      <p className="mt-3 text-base text-muted-foreground">
        Donnez le nom et le logo de votre entreprise — Tarinéo les reprendra sur vos devis clients.
      </p>

      <div className="mt-6 flex gap-2">
        <button
          type="button"
          onClick={() => setMode("site")}
          className={`rounded-full px-4 py-2 text-sm font-medium ${mode === "site" ? "bg-primary text-white" : "bg-secondary text-muted-foreground"}`}
        >
          Depuis mon site web
        </button>
        <button
          type="button"
          onClick={() => setMode("manuel")}
          className={`rounded-full px-4 py-2 text-sm font-medium ${mode === "manuel" ? "bg-primary text-white" : "bg-secondary text-muted-foreground"}`}
        >
          Saisie manuelle
        </button>
      </div>

      {mode === "site" && (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="url"
            value={siteUrl}
            onChange={(e) => setSiteUrl(e.target.value)}
            placeholder="https://www.mon-entreprise.fr"
            className="app-input h-12 flex-1"
          />
          <button
            type="button"
            onClick={recupererDepuisSite}
            disabled={chargement || !siteUrl.trim()}
            className="h-12 shrink-0 rounded-full bg-secondary px-6 text-sm font-medium disabled:opacity-50"
          >
            {chargement ? "Récupération…" : "Récupérer"}
          </button>
        </div>
      )}

      <div className="mt-6 space-y-4 rounded-[24px] bg-card p-6 ring-1 ring-border">
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Raison sociale</label>
          <input
            value={raisonSociale}
            onChange={(e) => setRaisonSociale(e.target.value)}
            className="app-input w-full"
            placeholder="Ex. Plomberie Dupont"
          />
        </div>

        <div className="flex items-center gap-4">
          {apercuLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={apercuLogo} alt="" className="h-16 w-16 rounded-lg border object-contain bg-white p-1" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground">
              Logo
            </div>
          )}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={surLogoLocal}
            className="text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:px-3 file:py-1.5"
          />
        </div>

        {mode === "manuel" && (
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Téléphone (optionnel)</label>
            <input
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              className="app-input w-full"
              placeholder="06 12 34 56 78"
            />
          </div>
        )}
      </div>

      {erreur && <p className="mt-4 text-sm text-red-500">{erreur}</p>}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => enregistrer(false)}
          disabled={enCours}
          className="flex h-14 flex-1 items-center justify-center rounded-full bg-primary text-base font-semibold text-white disabled:opacity-50"
        >
          {enCours ? "Enregistrement…" : "Continuer"}
        </button>
        <button
          type="button"
          onClick={() => enregistrer(true)}
          disabled={enCours}
          className="flex h-14 flex-1 items-center justify-center rounded-full border border-border bg-card text-base font-medium"
        >
          Passer cette étape
        </button>
      </div>
    </div>
  );
}

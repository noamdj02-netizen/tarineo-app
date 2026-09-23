"use client";

import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

const STORAGE_KEY = "tarineo.profil.preferences";

type Prefs = {
  notifications: boolean;
  notificationsPrix: boolean;
  emails: boolean;
};

const DEFAULTS: Prefs = {
  notifications: true,
  notificationsPrix: true,
  emails: true,
};

const LIGNES: { cle: keyof Prefs; titre: string; description: string }[] = [
  {
    cle: "notifications",
    titre: "Notifications",
    description: "Recevoir les alertes importantes",
  },
  {
    cle: "notificationsPrix",
    titre: "Notifications prix",
    description: "Être alerté des hausses de prix",
  },
  {
    cle: "emails",
    titre: "Emails Tarinéo",
    description: "Recevoir les informations importantes",
  },
];

function lirePrefs(): Prefs {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const brut = window.localStorage.getItem(STORAGE_KEY);
    if (!brut) return DEFAULTS;
    const parse = JSON.parse(brut) as Partial<Prefs>;
    return { ...DEFAULTS, ...parse };
  } catch {
    return DEFAULTS;
  }
}

export function ProfilPreferences() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [pret, setPret] = useState(false);

  useEffect(() => {
    setPrefs(lirePrefs());
    setPret(true);
  }, []);

  function maj(cle: keyof Prefs, valeur: boolean) {
    setPrefs((prev) => {
      const suivant = { ...prev, [cle]: valeur };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(suivant));
      } catch {
        // stockage indisponible — l'UI reste cohérente pour la session
      }
      return suivant;
    });
  }

  return (
    <section className="overflow-hidden rounded-[20px] bg-white shadow-[0_4px_14px_rgba(15,28,40,0.04)] ring-1 ring-foreground/8">
      <header className="px-4 pb-1 pt-4">
        <h2 className="text-[15px] font-semibold tracking-[-0.2px] text-[#0f1c28]">Préférences</h2>
      </header>
      <div>
        {LIGNES.map((ligne, i) => (
          <div key={ligne.cle}>
            {i > 0 && <Separator className="bg-[#EEF0F2]" />}
            <label
              htmlFor={`pref-${ligne.cle}`}
              className="flex min-h-[56px] cursor-pointer items-center gap-3 px-4 py-3.5 active:bg-muted/40"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-medium leading-snug text-[#0f1c28]">{ligne.titre}</p>
                <p className="mt-0.5 text-[13px] leading-snug text-[#8a96a3]">{ligne.description}</p>
              </div>
              <Switch
                id={`pref-${ligne.cle}`}
                checked={prefs[ligne.cle]}
                disabled={!pret}
                onCheckedChange={(v) => maj(ligne.cle, v)}
                aria-label={ligne.titre}
              />
            </label>
          </div>
        ))}
      </div>
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import { ChevronDownIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  titre: string;
  children: React.ReactNode;
  /** Permet de masquer définitivement (localStorage). */
  dismissible?: boolean;
  /** Ouvert par défaut à l'affichage. */
  defautOuvert?: boolean;
  className?: string;
};

export function BanniereRepliable({
  id,
  titre,
  children,
  dismissible = true,
  defautOuvert = true,
  className,
}: Props) {
  const cleOuvert = `tarineo-banniere-${id}-ouvert`;
  const cleMasque = `tarineo-banniere-${id}-masque`;
  const [ouvert, setOuvert] = useState(defautOuvert);
  const [masque, setMasque] = useState(false);

  useEffect(() => {
    try {
      // Lecture d'un système externe (localStorage), impossible au premier rendu
      // puisqu'il n'existe pas côté serveur — exception assumée à la règle, ce n'est
      // pas un état dérivé d'un autre état React.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (localStorage.getItem(cleMasque) === "1") setMasque(true);
      const stocke = localStorage.getItem(cleOuvert);
      if (stocke === "0") setOuvert(false);
      if (stocke === "1") setOuvert(true);
    } catch {
      // ignore
    }
  }, [cleMasque, cleOuvert]);

  function basculer() {
    const suivant = !ouvert;
    setOuvert(suivant);
    try {
      localStorage.setItem(cleOuvert, suivant ? "1" : "0");
    } catch {
      // ignore
    }
  }

  function fermer() {
    setMasque(true);
    try {
      localStorage.setItem(cleMasque, "1");
    } catch {
      // ignore
    }
  }

  if (masque) return null;

  return (
    <div className={cn("app-banner text-sm", className)}>
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={basculer}
          className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground"
          aria-expanded={ouvert}
          aria-label={ouvert ? "Replier le message" : "Déplier le message"}
        >
          <ChevronDownIcon className={cn("size-4 transition-transform duration-200", ouvert && "rotate-180")} />
        </button>
        <div className="min-w-0 flex-1">
          <button type="button" onClick={basculer} className="w-full text-left">
            <p className="font-medium text-foreground">{titre}</p>
          </button>
          {ouvert && <div className="mt-1 text-muted">{children}</div>}
        </div>
        {dismissible && (
          <button
            type="button"
            onClick={fermer}
            className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground"
            aria-label="Masquer ce message"
          >
            <XIcon className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}

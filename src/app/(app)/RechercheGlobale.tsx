"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FileTextIcon,
  FolderIcon,
  SearchIcon,
  StoreIcon,
  XIcon,
  ZapIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  suggestionsCategoriesEtFiltres,
  type SuggestionRecherche,
} from "@/lib/suggestionsRechercheTypes";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  compact?: boolean;
};

function iconeSuggestion(type: SuggestionRecherche["type"]) {
  if (type === "categorie") return FolderIcon;
  if (type === "fournisseur") return StoreIcon;
  if (type === "document") return FileTextIcon;
  if (type === "filtre") return ZapIcon;
  return SearchIcon;
}

export function RechercheGlobale({ className, compact = false }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const conteneurRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [requete, setRequete] = useState("");
  const [focus, setFocus] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionRecherche[]>([]);
  const [chargement, setChargement] = useState(false);
  const [indexActif, setIndexActif] = useState(-1);

  const panneauOuvert = focus && requete.trim().length >= 2;

  useEffect(() => {
    if (!pathname.startsWith("/documents")) return;
    const terme = searchParams.get("q") ?? searchParams.get("reference");
    // Synchronise la barre avec les filtres URL sur la page documents.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync URL → champ de recherche
    setRequete(terme ?? "");
  }, [pathname, searchParams]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const q = requete.trim();
    if (q.length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset suggestions quand requête courte
      setSuggestions([]);
      setChargement(false);
      setIndexActif(-1);
      return;
    }

    const locales = suggestionsCategoriesEtFiltres(q);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- debounce fetch suggestions
    setSuggestions(locales);
    setChargement(true);

    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/recherche/documents?q=${encodeURIComponent(q)}`);
        if (!res.ok) return;
        const data = (await res.json()) as { suggestions?: SuggestionRecherche[] };
        setSuggestions(data.suggestions ?? locales);
      } catch {
        setSuggestions(locales);
      } finally {
        setChargement(false);
      }
    }, 280);

    return () => window.clearTimeout(timer);
  }, [requete]);

  const naviguer = useCallback(
    (href: string) => {
      setFocus(false);
      inputRef.current?.blur();
      router.push(href);
    },
    [router],
  );

  function soumettre(e: React.FormEvent) {
    e.preventDefault();
    const q = requete.trim();
    if (q.length < 2) return;

    if (indexActif >= 0 && suggestions[indexActif]) {
      naviguer(suggestions[indexActif].href);
      return;
    }

    naviguer(`/documents?q=${encodeURIComponent(q)}`);
  }

  function effacer() {
    setRequete("");
    setSuggestions([]);
    setIndexActif(-1);
    inputRef.current?.focus();
    if (
      pathname.startsWith("/documents") &&
      (searchParams.get("q") || searchParams.get("reference"))
    ) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("q");
      params.delete("reference");
      const query = params.toString();
      router.push(query ? `/documents?${query}` : "/documents");
    }
  }

  function onKeyDownInput(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!panneauOuvert || suggestions.length === 0) {
      if (e.key === "Escape") inputRef.current?.blur();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndexActif((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndexActif((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Escape") {
      setFocus(false);
      inputRef.current?.blur();
    }
  }

  return (
    <div ref={conteneurRef} className={cn("relative min-w-0 flex-1", className)}>
      <form
        onSubmit={soumettre}
        className={cn(
          "relative transition-[box-shadow,background-color] duration-200",
          panneauOuvert && "z-20",
        )}
        role="search"
      >
        <SearchIcon
          className={cn(
            "pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground transition-colors duration-200",
            compact ? "left-3.5" : "left-4",
            focus && "text-primary",
          )}
        />
        <input
          ref={inputRef}
          type="search"
          value={requete}
          onChange={(e) => {
            setRequete(e.target.value);
            setIndexActif(-1);
          }}
          onFocus={() => setFocus(true)}
          onBlur={() => {
            window.setTimeout(() => {
              if (!conteneurRef.current?.contains(document.activeElement)) {
                setFocus(false);
                setIndexActif(-1);
              }
            }, 120);
          }}
          onKeyDown={onKeyDownInput}
          placeholder={compact ? "Rechercher…" : "Référence, fournisseur, devis…"}
          className={cn(
            "w-full rounded-full border-0 bg-secondary text-foreground outline-none placeholder:text-muted-foreground transition-[box-shadow,background-color,border-radius] duration-200",
            compact ? "h-10 pl-10 pr-16 text-sm" : "h-11 pl-11 pr-20 xl:h-12",
            focus && !panneauOuvert && "bg-card shadow-[0_0_0_2px_color-mix(in_oklch,var(--primary)_25%,transparent)]",
            panneauOuvert && "rounded-b-none rounded-t-[1.25rem] bg-card shadow-[0_0_0_2px_color-mix(in_oklch,var(--primary)_25%,transparent)]",
          )}
          aria-label="Rechercher dans vos documents"
          aria-expanded={panneauOuvert}
          aria-controls="suggestions-recherche"
          aria-autocomplete="list"
          aria-activedescendant={
            indexActif >= 0 ? `suggestion-${suggestions[indexActif]?.id}` : undefined
          }
          enterKeyHint="search"
          autoComplete="off"
          role="combobox"
        />
        {requete ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full"
            onMouseDown={(e) => e.preventDefault()}
            onClick={effacer}
            aria-label="Effacer la recherche"
          >
            <XIcon />
          </Button>
        ) : (
          !compact && (
            <kbd className="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 rounded-md border border-border bg-card px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground lg:inline">
              ⌘K
            </kbd>
          )
        )}
      </form>

      {panneauOuvert && (
        <div
          id="suggestions-recherche"
          role="listbox"
          className="absolute inset-x-0 top-full z-30 overflow-hidden rounded-b-[1.25rem] border border-t-0 border-border/60 bg-card shadow-lg animate-in fade-in slide-in-from-top-1 duration-150"
        >
          {chargement && suggestions.length === 0 ? (
            <div className="flex flex-col gap-2 p-3">
              <Skeleton className="h-10 rounded-xl" />
              <Skeleton className="h-10 rounded-xl" />
            </div>
          ) : suggestions.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">Aucune suggestion — Entrée pour chercher.</p>
          ) : (
            <ul className="flex max-h-[min(60vh,320px)] flex-col gap-0.5 overflow-y-auto p-2">
              {suggestions.map((suggestion, index) => {
                const Icone = iconeSuggestion(suggestion.type);
                const actif = index === indexActif;
                return (
                  <li key={suggestion.id} role="option" aria-selected={actif} id={`suggestion-${suggestion.id}`}>
                    <button
                      type="button"
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-150",
                        actif ? "bg-primary/10 text-primary" : "hover:bg-secondary",
                      )}
                      onMouseDown={(e) => e.preventDefault()}
                      onMouseEnter={() => setIndexActif(index)}
                      onClick={() => naviguer(suggestion.href)}
                    >
                      <span
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-full",
                          actif ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground",
                        )}
                      >
                        <Icone className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{suggestion.titre}</span>
                        {suggestion.sousTitre && (
                          <span className="block truncate text-xs text-muted-foreground">{suggestion.sousTitre}</span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="border-t border-border/60 px-4 py-2 text-[11px] text-muted-foreground">
            ↑↓ pour naviguer · Entrée pour ouvrir
          </p>
        </div>
      )}
    </div>
  );
}

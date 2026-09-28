"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { THEME_PREFS, type ThemePref } from "@/lib/theme";
import { useTheme } from "./theme-provider";

const MODE_META: Record<ThemePref, { label: string; icon: typeof Sun }> = {
  light: { label: "Clair", icon: Sun },
  dark: { label: "Sombre", icon: Moon },
  system: { label: "Système", icon: Monitor },
};

export function AppearanceSettings() {
  const { theme, resolved, setTheme } = useTheme();

  return (
    <div className="flex flex-col gap-6">
      <fieldset>
        <legend className="mb-3 text-[13px] font-medium text-ink">Mode</legend>
        <ToggleGroup
          value={[theme]}
          onValueChange={(next) => {
            const value = Array.isArray(next) ? next[0] : next;
            if (value === "light" || value === "dark" || value === "system") setTheme(value);
          }}
          variant="outline"
          className="flex w-full gap-0 overflow-hidden rounded-[12px] border border-line bg-surface p-0 sm:w-fit"
          aria-label="Mode d’apparence"
        >
          {THEME_PREFS.map((id) => {
            const { label, icon: Icon } = MODE_META[id];
            return (
              <ToggleGroupItem
                key={id}
                value={id}
                aria-label={label}
                className={cn(
                  "h-10 min-w-0 flex-1 rounded-none border-0 px-3.5 text-[13px] sm:flex-none",
                  "data-[pressed]:bg-tarineo-orange-soft data-[pressed]:text-tarineo-orange",
                  "data-[state=on]:bg-tarineo-orange-soft data-[state=on]:text-tarineo-orange",
                )}
              >
                <Icon data-icon="inline-start" />
                {label}
              </ToggleGroupItem>
            );
          })}
        </ToggleGroup>
        <p className="mt-2 text-[12px] text-muted-foreground">
          La barre latérale suit automatiquement le mode de l’application.
        </p>
      </fieldset>

      <div>
        <p className="mb-2 text-[12px] text-muted-foreground">Aperçu</p>
        <ThemePreview resolved={resolved} />
      </div>
    </div>
  );
}

function ThemePreview({ resolved }: { resolved: "light" | "dark" }) {
  const canvas = resolved === "dark" ? "#0A0A0A" : "#F5F5F3";
  const surface = resolved === "dark" ? "#111111" : "#FFFFFF";
  const side = resolved === "dark" ? "#0A0A0A" : "#FFFFFF";
  const sideLine = resolved === "dark" ? "rgba(255,255,255,.12)" : "rgba(10,10,10,.10)";
  const line = resolved === "dark" ? "rgba(255,255,255,.10)" : "rgba(10,10,10,.08)";
  const ink = resolved === "dark" ? "#F5F5F3" : "#0A0A0A";
  const mute = resolved === "dark" ? "#A3A3A3" : "#6E6E6E";

  return (
    <div
      className="flex h-[72px] w-[128px] overflow-hidden rounded-[12px] border border-line"
      style={{ background: canvas }}
      aria-hidden
    >
      <div
        className="flex w-[34px] flex-col gap-1.5 p-1.5"
        style={{ background: side, borderRight: `1px solid ${sideLine}` }}
      >
        <span className="h-1.5 w-5 rounded-full bg-[#FF6B1A]" />
        <span className="h-1 w-4 rounded-full" style={{ background: mute }} />
        <span className="h-1 w-3.5 rounded-full opacity-50" style={{ background: mute }} />
      </div>
      <div className="flex flex-1 flex-col">
        <div className="h-3.5 border-b" style={{ background: surface, borderColor: line }} />
        <div className="m-1.5 flex-1 rounded-[6px] border" style={{ background: surface, borderColor: line }}>
          <span className="mt-1.5 ml-1.5 block h-1 w-8 rounded-full" style={{ background: ink, opacity: 0.35 }} />
        </div>
      </div>
    </div>
  );
}

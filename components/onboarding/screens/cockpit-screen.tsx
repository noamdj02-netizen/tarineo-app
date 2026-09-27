import { AvatarForm } from "@/app/(app)/compte/forms";
import { WIDGET_LABELS, type WidgetKey } from "@/lib/home/dashboard-prefs";
import { cn } from "@/lib/utils";

export const COCKPIT_PRESETS: {
  id: string;
  label: string;
  text: string;
  widgets: Record<WidgetKey, boolean>;
}[] = [
  {
    id: "focus",
    label: "Focus",
    text: "Copilote, favori, semaine, projets",
    widgets: {
      prompt: true,
      actions: true,
      week: true,
      focus: true,
      projects: true,
      calendar: false,
      postits: false,
      schemas: false,
      metier: false,
    },
  },
  {
    id: "planning",
    label: "Planning",
    text: "Agenda, semaine, post-its",
    widgets: {
      prompt: false,
      calendar: true,
      week: true,
      postits: true,
      actions: true,
      focus: false,
      projects: false,
      schemas: false,
      metier: false,
    },
  },
  {
    id: "studio",
    label: "Studio",
    text: "Copilote, projets, schémas, landings",
    widgets: {
      prompt: true,
      projects: true,
      schemas: true,
      actions: true,
      focus: true,
      calendar: false,
      week: false,
      postits: false,
      metier: false,
    },
  },
];

const WIDGET_HINTS: Record<WidgetKey, string> = {
  prompt: "Question du jour vers le copilote",
  calendar: "Ton agenda du jour",
  week: "Ce que tu as fait cette semaine",
  focus: "Le projet Focus, favori du tableau",
  actions: "Raccourcis focus, landing, thèmes",
  postits: "Notes libres sur le tableau",
  projects: "Tes projets, un clic",
  schemas: "Derniers schémas",
  metier: "Cartes métier : hausses, devis, produits",
};

export function CockpitScreen({
  avatarUrl,
  initial,
  preset,
  widgets,
  onPreset,
  onToggle,
}: {
  avatarUrl: string | null;
  initial: string;
  preset: string;
  widgets: Record<WidgetKey, boolean>;
  onPreset: (id: string, widgets: Record<WidgetKey, boolean>) => void;
  onToggle: (key: WidgetKey) => void;
}) {
  return (
    <>
      <h2 className="font-serif text-[1.7rem] leading-[1.1] tracking-[-0.02em]">
        Tes blocs d’accueil
      </h2>
      <p className="mt-2 text-[14.5px] leading-relaxed text-muted-foreground">
        Un preset, puis tu ajustes. Photo optionnelle.
      </p>
      <div className="mt-5">
        <AvatarForm avatarUrl={avatarUrl} initial={initial} />
      </div>
      <div className="mt-5 grid grid-cols-3 gap-1.5 sm:gap-2">
        {COCKPIT_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onPreset(p.id, p.widgets)}
            className={cn(
              "pressable min-h-16 rounded-2xl border px-2 py-2.5 text-left sm:px-3 sm:py-3",
              preset === p.id ? "border-ink bg-ink text-accent-ink" : "border-line",
            )}
          >
            <span className="block text-[14.5px] font-medium">{p.label}</span>
            <span
              className={cn(
                "mt-0.5 block text-[11px] leading-snug line-clamp-2 sm:text-[12.5px]",
                preset === p.id ? "text-accent-ink/70" : "text-muted-foreground",
              )}
            >
              {p.text}
            </span>
          </button>
        ))}
      </div>
      <ul className="mt-5 flex flex-col gap-2">
        {(Object.keys(WIDGET_LABELS) as WidgetKey[]).map((key) => (
          <li key={key}>
            <label className="flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border border-line px-3 py-2.5">
              <input
                type="checkbox"
                checked={widgets[key]}
                onChange={() => onToggle(key)}
                className="mt-1"
              />
              <span>
                <span className="block text-[14.5px] font-medium">{WIDGET_LABELS[key]}</span>
                <span className="block text-[12.5px] text-muted-foreground">{WIDGET_HINTS[key]}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>
    </>
  );
}

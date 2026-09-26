import type { ProjectFull, ProjectSummary } from "./types";

export type CoachTone = "ok" | "alert" | "warn";
export type CardSignal = "ok" | "alert" | "warn" | "mute";

export type CoachMove =
  | { kind: "focus"; id: string; label: string; tone: "ok"; projectId: string }
  | { kind: "pause"; id: string; label: string; tone: "alert"; projectIds: string[] }
  | { kind: "ask"; id: string; label: string; tone: "ask"; prompt: string }
  | { kind: "link"; id: string; label: string; tone: "ok" | "alert" | "ask"; href: string };

export type CoachBrief = {
  tone: CoachTone;
  kicker: string;
  title: string;
  body: string;
  moves: CoachMove[];
  signals: Record<string, CardSignal>;
};

function score(p: Pick<ProjectSummary, "stage" | "next" | "featuresDone" | "tasksDone">) {
  return p.stage * 10 + (p.next ? 8 : 0) + p.featuresDone * 2 + p.tasksDone;
}

function pickKeep(list: ProjectSummary[]) {
  return [...list].sort((a, b) => score(b) - score(a))[0] ?? null;
}

function signalsFor(
  projects: ProjectSummary[],
  keepId: string | null,
  extras: Set<string>,
): Record<string, CardSignal> {
  return Object.fromEntries(
    projects.map((p) => {
      if (keepId && p.id === keepId) return [p.id, "ok" as const];
      if (extras.has(p.id)) return [p.id, "alert" as const];
      if (p.status === "pause") return [p.id, "warn" as const];
      return [p.id, "mute" as const];
    }),
  );
}

/** Conseil portfolio : un seul Focus, le copilote propose le geste. */
export function boardCoach(projects: ProjectSummary[]): CoachBrief {
  const focus = projects.filter((p) => p.status === "focus");
  const live = projects.filter((p) => p.status !== "fini");
  const keep = pickKeep(focus.length ? focus : live);
  const extras = new Set(focus.filter((p) => p.id !== keep?.id).map((p) => p.id));

  if (focus.length > 1 && keep) {
    const extraList = focus.filter((p) => p.id !== keep.id);
    return {
      tone: "alert",
      kicker: "Copilote",
      title: `${focus.length} projets en Focus`,
      body: `${focus.map((p) => p.name).join(", ")}. Ta règle : un seul, jusqu’à sa première vente. Je te propose de garder ${keep.name} (le plus avancé) et de passer les autres en pause.`,
      moves: [
        { kind: "focus", id: "keep", label: `Garder ${keep.name}`, tone: "ok", projectId: keep.id },
        {
          kind: "pause",
          id: "pause-all",
          label: `Pause les ${extraList.length} autres`,
          tone: "alert",
          projectIds: extraList.map((p) => p.id),
        },
        ...extraList.slice(0, 3).map(
          (p): CoachMove => ({
            kind: "pause",
            id: `pause-${p.id}`,
            label: `Pause ${p.name}`,
            tone: "alert",
            projectIds: [p.id],
          }),
        ),
        {
          kind: "ask",
          id: "ask-pick",
          label: "Choisis pour moi",
          tone: "ask",
          prompt: `Tu vois mes projets. ${focus.length} sont en Focus : ${focus.map((p) => p.name).join(", ")}. Règle Mon Bureau : un seul jusqu’à la première vente. Choisis-en UN (le plus proche d’une vente), mets les autres en pause avec tes outils, et écris la prochaine action du Focus.`,
        },
      ],
      signals: signalsFor(projects, keep.id, extras),
    };
  }

  if (focus.length === 0) {
    return {
      tone: "warn",
      kicker: "Copilote",
      title: "Aucun projet en Focus",
      body: keep
        ? `Rien n’est prioritaire. Je te propose ${keep.name} : mets-le en Focus et pose une action de 25 minutes.`
        : "Crée un projet, puis mets-le en Focus. Un seul, jusqu’à la première vente.",
      moves: keep
        ? [
            { kind: "focus", id: "pick", label: `Focus ${keep.name}`, tone: "ok", projectId: keep.id },
            {
              kind: "ask",
              id: "ask-empty",
              label: "Propose une action",
              tone: "ask",
              prompt: `Aucun projet n’est en Focus. Parmi ${live.map((p) => p.name).join(", ") || "mes projets"}, choisis-en un, mets-le en Focus, et écris UNE prochaine action concrète pour les 25 prochaines minutes.`,
            },
          ]
        : [],
      signals: signalsFor(projects, keep?.id ?? null, extras),
    };
  }

  const f = focus[0];
  const holes: string[] = [];
  if (!f.next) holes.push("une prochaine action");
  if (!f.featuresTotal) holes.push("une première fonction");
  if (!f.site && f.stage >= 4) holes.push("l’URL du site");

  if (holes.length) {
    return {
      tone: "warn",
      kicker: "Copilote",
      title: `${f.name} est ton Focus`,
      body: `Il manque ${holes.join(", ")}. Je peux les poser maintenant, ou tu ouvres la page.`,
      moves: [
        {
          kind: "link",
          id: "open",
          label: `Ouvrir ${f.name}`,
          tone: "ok",
          href: `/projets/${f.slug}`,
        },
        !f.next
          ? {
              kind: "ask",
              id: "ask-next",
              label: "Écrire la prochaine action",
              tone: "ask",
              prompt: `Pour ${f.name} : quelle est la meilleure prochaine action cette semaine, et pourquoi ? Donne 3 étapes concrètes. Écris-la dans le champ next.`,
            }
          : {
              kind: "ask",
              id: "ask-bilan",
              label: "Bilan du Focus",
              tone: "ask",
              prompt: `Fais le bilan de ${f.name} : ce qui bloque, et les 3 actions pour la première vente.`,
            },
      ],
      signals: signalsFor(projects, f.id, extras),
    };
  }

  return {
    tone: "ok",
    kicker: "Copilote",
    title: `${f.name} est ton Focus`,
    body: `Prochaine action : ${f.next}. Avance là-dessus. Les autres restent en pause.`,
    moves: [
      { kind: "link", id: "open", label: `Ouvrir ${f.name}`, tone: "ok", href: `/projets/${f.slug}` },
      {
        kind: "ask",
        id: "ask-do",
        label: "Fais-le avec moi",
        tone: "ask",
        prompt: `${f.name} est mon Focus. Prochaine action : ${f.next} Fais le geste (tâche, note, mail) au lieu de me le redemander.`,
      },
    ],
    signals: signalsFor(projects, f.id, extras),
  };
}

/** Conseil fiche projet : rouge = trou, vert = geste. */
export function projectCoach(
  p: ProjectFull,
  media: { landings: number; schemas: number; focusCount: number },
): CoachBrief {
  const reds: string[] = [];
  if (media.focusCount > 1 && p.status === "focus") {
    reds.push(`${media.focusCount} projets en Focus : un seul jusqu’à la première vente`);
  }
  if (!p.next) reds.push("pas de prochaine action");
  if (!p.features.length) reds.push("aucune fonction listée");
  if (!p.tasks.some((t) => !t.done)) reds.push("aucune tâche ouverte");
  if (!media.landings) reds.push("pas de landing attachée");
  if (!media.schemas) reds.push("pas de schéma");

  const moves: CoachMove[] = [];
  if (media.focusCount > 1 && p.status === "focus") {
    moves.push({
      kind: "focus",
      id: "keep-this",
      label: `Garder ${p.name} seul`,
      tone: "ok",
      projectId: p.id,
    });
    moves.push({
      kind: "ask",
      id: "ask-focus",
      label: "Choisis le Focus",
      tone: "ask",
      prompt: `${media.focusCount} projets sont en Focus. Je suis sur ${p.name}. Garde celui-ci ou un autre, mets les autres en pause, et écris la prochaine action.`,
    });
  }
  if (!p.next) {
    moves.push({
      kind: "ask",
      id: "ask-next",
      label: "Écrire la prochaine action",
      tone: "ask",
      prompt: `Pour ${p.name} : quelle est la meilleure prochaine action cette semaine ? Écris-la dans next, 3 étapes max.`,
    });
  }
  if (!media.landings) {
    moves.push({
      kind: "link",
      id: "hero",
      label: "Choisir un hero",
      tone: "ok",
      href: "/bibliotheque/heros",
    });
  }
  if (!media.schemas) {
    moves.push({
      kind: "link",
      id: "schema",
      label: "Dessiner le parcours",
      tone: "ok",
      href: "/schemas",
    });
  }
  if (p.next) {
    moves.push({
      kind: "ask",
      id: "ask-do",
      label: "Fais cette action",
      tone: "ask",
      prompt: `${p.name} : prochaine action « ${p.next} ». Fais le geste (tâche, mail, note). Ne me dis pas de le faire.`,
    });
  }

  if (reds.length) {
    return {
      tone: media.focusCount > 1 ? "alert" : "warn",
      kicker: "Copilote",
      title: media.focusCount > 1 ? "Trop de Focus" : `Je vois ${reds.length} trou${reds.length > 1 ? "s" : ""}`,
      body: `${reds.join(". ")}. Je propose le geste, pas un pavé.`,
      moves: moves.slice(0, 4),
      signals: { [p.id]: media.focusCount > 1 ? "alert" : "mute" },
    };
  }

  return {
    tone: "ok",
    kicker: "Copilote",
    title: `${p.name} est carré`,
    body: p.next
      ? `Prochaine action : ${p.next}. Je peux la faire avec toi.`
      : "Le projet a ce qu’il faut. Ouvre le copilote si tu bloques.",
    moves: moves.slice(0, 3),
    signals: { [p.id]: "ok" },
  };
}

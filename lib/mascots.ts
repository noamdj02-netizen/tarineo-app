/**
 * Mascottes PNG exportées depuis Figma « NOAM-illustrationstitre » (nodes 30:1200–30:1215).
 * Fichier source : https://www.figma.com/design/9bFrz4hU7bEUcqpbKxYbTv/NOAM-illustrationstitre
 */

export const MASCOTS = {
  "01-ordi-check": {
    label: "Ordinateur, tâche validée",
    src: "/illustrations/mascots/01-ordi-check.png",
    figmaNode: "30:1200",
  },
  "02-todo-liste": {
    label: "Liste de tâches",
    src: "/illustrations/mascots/02-todo-liste.png",
    figmaNode: "30:1201",
  },
  "03-idee": {
    label: "Une idée",
    src: "/illustrations/mascots/03-idee.png",
    figmaNode: "30:1202",
  },
  "04-tableau-postit": {
    label: "Tableau et post-its",
    src: "/illustrations/mascots/04-tableau-postit.png",
    figmaNode: "30:1203",
  },
  "05-detente": {
    label: "Détente au bureau",
    src: "/illustrations/mascots/05-detente.png",
    figmaNode: "30:1204",
  },
  "06-casque-focus": {
    label: "Focus avec casque",
    src: "/illustrations/mascots/06-casque-focus.png",
    figmaNode: "30:1205",
  },
  "07-chat-robot": {
    label: "Copilote IA",
    src: "/illustrations/mascots/07-chat-robot.png",
    figmaNode: "30:1206",
  },
  "08-croissance": {
    label: "Croissance",
    src: "/illustrations/mascots/08-croissance.png",
    figmaNode: "30:1207",
  },
  "09-voyage-avion": {
    label: "Travail et voyage",
    src: "/illustrations/mascots/09-voyage-avion.png",
    figmaNode: "30:1208",
  },
  "10-objectif-cible": {
    label: "Objectif atteint",
    src: "/illustrations/mascots/10-objectif-cible.png",
    figmaNode: "30:1209",
  },
  "11-checklist": {
    label: "Checklist",
    src: "/illustrations/mascots/11-checklist.png",
    figmaNode: "30:1210",
  },
  "12-victoire": {
    label: "Victoire",
    src: "/illustrations/mascots/12-victoire.png",
    figmaNode: "30:1211",
  },
  "13-organisation": {
    label: "Organisation",
    src: "/illustrations/mascots/13-organisation.png",
    figmaNode: "30:1212",
  },
  "14-taches-ordi": {
    label: "Tâches sur ordinateur",
    src: "/illustrations/mascots/14-taches-ordi.png",
    figmaNode: "30:1213",
  },
  "15-vision-longue-vue": {
    label: "Vision long terme",
    src: "/illustrations/mascots/15-vision-longue-vue.png",
    figmaNode: "30:1214",
  },
  "16-presentation-graph": {
    label: "Présentation et graphique",
    src: "/illustrations/mascots/16-presentation-graph.png",
    figmaNode: "30:1215",
  },
} satisfies Record<string, { label: string; src: string; figmaNode: string }>;

export type MascotName = keyof typeof MASCOTS;

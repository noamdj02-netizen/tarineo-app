/**
 * Illustrations au trait du fichier Figma « NOAM-illustrationstitre ».
 * Chaque illustration = un cadre de 320 px, une zone de dessin (box, en px dans ce cadre)
 * et 1 à 3 calques SVG (public/illustrations/<id>-<calque>.svg) placés en % de la zone.
 * Les calques sont retournés verticalement, comme dans le fichier Figma.
 */

type Layer = "fond" | "accent" | "trait";

export type IllustrationDef = {
  label: string;
  /** left, top, width, height dans le cadre de 320 px */
  box: [number, number, number, number];
  /** calque, inset CSS « haut droite bas gauche » en %, débord éventuel du SVG « vertical horizontal » en % */
  layers: [Layer, string, string?][];
};

const def = (label: string, box: IllustrationDef["box"], ...layers: IllustrationDef["layers"]) => ({
  label,
  box,
  layers,
});

export const ILLUSTRATIONS = {
  "landing-idee": def("Une idée", [59.93, 32, 200.145, 256], ["accent", "12.63 40.41 73.37 43.02"], ["trait", "27.5 7 5.08 6.69"]),
  "landing-croissance": def("Faire grandir", [32, 64.94, 256, 190.129], ["accent", "51.9 13.04 21.42 59.18"], ["trait", "9.1 7.05 9.25 6.59"]),
  "landing-progression": def("Progresser marche après marche", [32, 43.18, 256, 233.631], ["accent", "39.3 17.96 50.72 73.67"], ["trait", "6.4 5.83 5.96 5.48"]),
  "landing-resultats": def("Présenter des résultats", [32, 57.26, 256, 205.489], ["accent", "15.11 12.13 63.73 66.82"], ["trait", "6.6 5.03 6.71 5.38"]),
  "landing-revenus": def("Succès, pluie de billets", [32, 53.41, 256, 213.175], ["fond", "64.93 6.51 5.97 7.82", "-1.69 -0.48"], ["accent", "12.4 7.1 7.25 8.4"], ["trait", "5.15 4.18 4.99 4.18"]),
  "landing-victoire": def("Victoire", [39.6, 32, 240.792, 256], ["trait", "6.07 6.34 5.91 6.08"]),
  "landing-commencer": def("Ouvrir la porte", [38.16, 32, 243.679, 256], ["accent", "10.11 10.18 8.65 71.9"], ["trait", "6.17 6.69 5.97 6.48"]),
  "onboarding-bienvenue": def("On avance ensemble", [32, 38.1, 256, 243.81], ["trait", "6.24 6.34 6.29 5.95"]),
  "onboarding-decouvrir": def("Lire la carte", [43.5, 32, 233.006, 256], ["fond", "31.84 11.83 22.73 12.36", "-1.45 -0.95"], ["accent", "33.49 15.13 23.88 14.97"], ["trait", "6.74 7.38 6.81 7.65"]),
  "onboarding-configurer": def("Réglages", [32, 49.12, 256, 221.758], ["accent", "12.55 53.89 74.85 27.08"], ["trait", "8.93 7.07 8.56 7.35"]),
  "onboarding-objectif": def("Rêver son objectif", [34.06, 32, 251.871, 256], ["trait", "6.2 6.57 6.06 6.58"]),
  "onboarding-premier-pas": def("Écrire le premier élément", [32, 41.53, 256, 236.936], ["accent", "27.91 26.74 18.66 54.65"], ["trait", "6.92 12.21 6.8 6.21"]),
  "dashboard-au-travail": def("Au travail", [32, 64.91, 256, 190.171], ["accent", "52.31 19.9 41.7 75.84"], ["trait", "7.6 5.54 7.33 5.33"]),
  "dashboard-focus": def("Concentré sur l’ordinateur", [32, 67.78, 256, 184.43], ["accent", "52 19.76 41.98 75.98"], ["trait", "8.24 6.34 8.78 6.05"]),
  "dashboard-tache-validee": def("Tâche validée", [32, 56.29, 256, 207.426], ["accent", "71.31 28.2 23.58 67.84"], ["trait", "7.27 5.94 7.17 5.77"]),
  "dashboard-devis": def("Document, devis", [32, 45.76, 256, 228.486], ["fond", "11.84 14.72 34.4 48.36", "-1.07 -1.39"], ["accent", "5.82 21.05 38.8 31.22"], ["trait", "11.15 5.43 6.05 5.32"]),
  "dashboard-import": def("Porter des dossiers", [32, 32, 256, 256], ["fond", "21.47 9.51 40.78 59.34", "-1.56 -1.89"], ["accent", "22.9 10.36 42.53 60.73"], ["trait", "6.32 6.44 6.03 6.17"]),
  "dashboard-deadline": def("Deadline", [32, 79.38, 256, 161.231], ["accent", "9.45 25.92 26.62 58.05"], ["trait", "9.86 5.5 8.61 5.42"]),
  "dashboard-depenses": def("Dépenses", [32, 51.03, 256, 217.946], ["trait", "5.98 5.24 6.37 5.42"]),
  "dashboard-analyse": def("Inspecter à la loupe", [32, 66.79, 256, 186.421], ["accent", "23.26 6.04 68.11 90.44"], ["trait", "8.49 6.46 8.1 6.17"]),
  "dashboard-rapport": def("Lire un rapport", [34.39, 32, 251.23, 256], ["trait", "7.04 7.45 7.15 7.28"]),
  "empty-aucun-resultat": def("Chercher à la loupe", [32, 36.27, 256, 247.467], ["accent", "29.35 6.67 45.86 74.34"], ["trait", "6.95 7.75 6.62 6.68"]),
  "empty-rien-ici": def("Allongé devant l’ordinateur", [32, 116.92, 256, 86.154], ["accent", "45.66 16.47 44.48 80.17"], ["trait", "16.07 5.41 16.14 5.57"]),
  "empty-pause-cafe": def("Pause café", [32, 59.22, 256, 201.557], ["accent", "41.98 20.36 15.31 31.11"], ["trait", "6.51 5.1 6.61 5.34"]),
  "empty-tout-est-calme": def("Tout est calme", [32, 63.82, 256, 192.354], ["trait", "8.71 6.24 8.83 6.6"]),
  "feedback-succes": def("Validé", [32, 36.09, 256, 247.83], ["accent", "6.19 13.32 71.39 70.64"], ["trait", "6.46 6.68 6.8 5.98"]),
  "feedback-envoye": def("Avion en papier envoyé", [32, 78.21, 256, 163.585], ["trait", "7.66 4.62 7.42 4.79"]),
  "feedback-upload": def("Pousser une carte", [32, 43.64, 256, 232.727], ["accent", "29.73 10.34 26.9 30.54"], ["trait", "8.24 7.54 7.91 7.4"]),
  "feedback-chargement": def("Courir", [32, 92.04, 256, 135.929], ["trait", "9.23 5.31 9.6 4.99"]),
  "feedback-erreur": def("Coincé dans un trou", [32, 68.25, 256, 183.491], ["trait", "14.41 6.91 9.35 6.37"]),
  "feedback-maintenance": def("Réparer", [32, 42.84, 256, 234.328], ["trait", "6.52 5.98 6.94 6.11"]),
  "feedback-surcharge": def("Trop de choses", [32, 33.57, 256, 252.859], ["trait", "7.44 6.81 7.16 7.36"]),
  "feedback-aide": def("Lire l’aide", [57.87, 32, 204.269, 256], ["accent", "7.05 55.52 90.65 41.61"], ["trait", "6.48 7.32 5.84 7.79"]),
  "feedback-question": def("Une question", [54.26, 32, 211.478, 256], ["accent", "5.45 12.62 75.4 74.27"], ["trait", "14.65 6.96 5.46 6.44"]),
  "notif-nouvelle": def("Nouvelle notification", [32.72, 32, 254.562, 256], ["accent", "14.69 13.56 80.73 83.52"], ["trait", "6.62 14.49 6.25 6.29"]),
  "notif-like": def("Un avis, un cœur", [70.4, 32, 179.2, 256], ["accent", "14.38 32.81 69.8 48.66"], ["trait", "10.43 10.11 7.05 10.08"]),
} satisfies Record<string, IllustrationDef>;

export type IllustrationName = keyof typeof ILLUSTRATIONS;

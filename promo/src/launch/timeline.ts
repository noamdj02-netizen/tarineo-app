/** Durées calées sur les mp3 de public/audio (30 fps, +2 images de marge). */

export const BURST_DURATION = 64;
export const PUNCH_DURATION = 66;
/** Icônes, puis la phrase. 28 images d’entrée + voix + queue. */
export const APPS_DURATION = 185;
/** Recherche des projets, puis le Focus. La voix tient dans les 65 premières images utiles. */
export const OPENING_DURATION = 108;
export const CLOSE_DURATION = 116;

const SCREEN_LEAD = 8;
const SCREEN_TAIL = 16;

export const SHOTS = [
  {
    id: "accueil",
    file: "accueil.png",
    title: "Tout est là.",
    voice: "vo-accueil.mp3",
    line: "Onglets, chat, agenda : tu perds le fil. Ici tu demandes au copilote, et tu vois ta semaine.",
    voiceFrames: 175,
  },
  {
    id: "projets",
    file: "projets.png",
    title: "Un seul en Focus.",
    voice: "vo-projets.mp3",
    line: "Quatre side-projects, aucune vente. Navpit n'en garde qu'un. Jusqu'à la première vente.",
    voiceFrames: 173,
  },
  {
    id: "focus",
    file: "focus.png",
    title: "Tu sais quoi faire.",
    voice: "vo-focus.mp3",
    line: "Tu ouvres le projet, et tu as oublié. Là, l'étape, la prochaine action, les liens : c'est déjà écrit.",
    voiceFrames: 202,
  },
  {
    id: "schemas",
    file: "schemas.png",
    title: "Hors de ta tête.",
    voice: "vo-schemas.mp3",
    line: "Le parcours est dans ta tête, ou dans un fichier mort. Tu dessines. Ou l'IA le trace.",
    voiceFrames: 149,
  },
  {
    id: "roadmap",
    file: "roadmap.png",
    title: "Le plan se voit.",
    voice: "vo-roadmap.mp3",
    line: "Le plan n'est plus un doc que personne n'ouvre. C'est la toile.",
    voiceFrames: 106,
  },
  {
    id: "anatomie",
    file: "anatomie.png",
    title: "Plus de landing au hasard.",
    voice: "vo-anatomie.mp3",
    line: "Tu bloques sur la page. Voilà les 12 frames d'une landing qui convertit.",
    voiceFrames: 132,
  },
  {
    id: "composants",
    file: "composants.png",
    title: "Fini la page blanche.",
    voice: "vo-composants.mp3",
    line: "Tu ne restyles plus de zéro. Les composants sont prêts. Tu copies, tu avances.",
    voiceFrames: 154,
  },
  {
    id: "composants-2",
    file: "composants-2.png",
    title: "Le niveau Framer.",
    voice: "vo-composants-2.mp3",
    line: "Du vrai pixel. Sans trois jours dans Figma.",
    voiceFrames: 79,
  },
  {
    id: "mono-lead",
    file: "mono-lead.png",
    title: "Le prompt est prêt.",
    voice: "vo-mono-lead.mp3",
    line: "Le curseur clignote, tu stagnes. Ici le prompt est déjà là.",
    voiceFrames: 120,
  },
  {
    id: "ressources",
    file: "ressources.png",
    title: "Plus de drive perdu.",
    voice: "vo-ressources.mp3",
    line: "Favoris, Figma, un dossier Design. Ici, design et code sont au même endroit.",
    voiceFrames: 204,
  },
  {
    id: "outils",
    file: "outils.png",
    title: "Ta stack, une liste.",
    voice: "vo-outils.mp3",
    line: "Quinze onglets d'outils. Ici, ta stack tient en une liste.",
    voiceFrames: 98,
  },
  {
    id: "prelanding",
    file: "prelanding.png",
    title: "Plus de canvas vide.",
    voice: "vo-prelanding.mp3",
    line: "L'éditeur ouvert, rien dessus. Prends une pre-landing. Et pars.",
    voiceFrames: 146,
  },
  {
    id: "launchpad",
    file: "launchpad.png",
    title: "Un système pour sortir.",
    voice: "vo-launchpad.mp3",
    line: "Pas une idée de plus. Un modèle. Pour lancer.",
    voiceFrames: 86,
  },
].map((shot) => ({ ...shot, frames: SCREEN_LEAD + shot.voiceFrames + SCREEN_TAIL }));

export const SCREENS_DURATION = SHOTS.reduce((sum, shot) => sum + shot.frames, 0);

export type VoiceCue = { id: string; voice: string; from: number; voiceFrames: number };

const cues: VoiceCue[] = [
  { id: "apps", voice: "vo-apps.mp3", from: 28, voiceFrames: 139 },
  { id: "projet", voice: "vo-projet.mp3", from: APPS_DURATION + 8, voiceFrames: 65 },
];

let cursor = APPS_DURATION + OPENING_DURATION;
for (const shot of SHOTS) {
  cues.push({ id: shot.id, voice: shot.voice, from: cursor + SCREEN_LEAD, voiceFrames: shot.voiceFrames });
  cursor += shot.frames;
}
cues.push({ id: "close", voice: "vo-close.mp3", from: cursor + 16, voiceFrames: 74 });

export const VOICE_CUES = cues;

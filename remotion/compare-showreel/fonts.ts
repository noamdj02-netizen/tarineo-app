import { loadFont as loadTight } from "@remotion/google-fonts/InterTight";
import { loadFont as loadGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

const tight = loadTight("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});
const grotesk = loadGrotesk("normal", {
  weights: ["500", "600", "700"],
  subsets: ["latin"],
});
const mono = loadMono("normal", {
  weights: ["500", "600"],
  subsets: ["latin"],
});

export const fontSans = tight.fontFamily;
export const fontDisplay = grotesk.fontFamily;
export const fontMono = mono.fontFamily;

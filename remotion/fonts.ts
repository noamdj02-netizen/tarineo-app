import { loadFont as loadTight } from "@remotion/google-fonts/InterTight";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

const tight = loadTight("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});
const mono = loadMono("normal", {
  weights: ["400", "500"],
  subsets: ["latin"],
});

export const fontSans = tight.fontFamily;
export const fontMono = mono.fontFamily;

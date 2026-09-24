import type { ReactNode } from "react";
import { BentoPreview } from "./bento";
import { CommandPreview } from "./command";
import { DarkTerminalPreview } from "./dark-terminal";
import { EditorialPreview } from "./editorial";
import { FounderPreview } from "./founder";
import { LaunchpadPreview } from "./launchpad";
import { LinearPreview } from "./linear";
import { OrbitPreview } from "./orbit";
import { ProductFirstPreview } from "./product-first";
import { SplitPreview } from "./split";

/** Un composant d'aperçu par template (clé = id du template). */
export const PREVIEWS: Record<string, () => ReactNode> = {
  launchpad: LaunchpadPreview,
  linear: LinearPreview,
  "dark-terminal": DarkTerminalPreview,
  editorial: EditorialPreview,
  bento: BentoPreview,
  orbit: OrbitPreview,
  split: SplitPreview,
  "product-first": ProductFirstPreview,
  founder: FounderPreview,
  command: CommandPreview,
};

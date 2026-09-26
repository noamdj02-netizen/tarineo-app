import { TOOL_GROUPS, type Tool, type ToolGroup } from "@/lib/design-data/tools";

export type ConnectorKind = "mcp" | "url" | "oauth" | "secret" | "feed" | "internal";
export type ToolLinkField = "figma" | "notion" | "github" | "site";
export type OauthProvider = "google" | "github";

export type ConnectorMeta = {
  kind: ConnectorKind;
  connectUrl: string;
  hint: string;
  stayHref: string;
  stayLabel: string;
  bindLabel: string;
  bindPlaceholder?: string;
  linkField?: ToolLinkField;
  oauth?: OauthProvider;
};

export function toolId(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const META: Record<string, ConnectorMeta> = {
  Notion: {
    kind: "url",
    connectUrl: "https://www.notion.so",
    hint: "Colle l’URL officielle de ton espace Notion. Le copilote la voit sur le Focus.",
    stayHref: "/copilote?role=produit",
    stayLabel: "Continuer dans le copilote",
    bindLabel: "URL Notion",
    bindPlaceholder: "https://www.notion.so/…",
    linkField: "notion",
  },
  Excalidraw: {
    kind: "internal",
    connectUrl: "/schemas",
    hint: "Les schémas Navpit remplacent Excalidraw. Active, puis dessine ici.",
    stayHref: "/schemas",
    stayLabel: "Ouvrir les schémas",
    bindLabel: "Schémas Navpit",
  },
  Claude: {
    kind: "mcp",
    connectUrl: "/copilote",
    hint: "Navpit crée une clé officielle. Claude lit et écrit tes projets.",
    stayHref: "/copilote",
    stayLabel: "Ouvrir le copilote",
    bindLabel: "Clé MCP Navpit",
  },
  ChatGPT: {
    kind: "mcp",
    connectUrl: "/copilote",
    hint: "Même clé MCP officielle. ChatGPT parle à tes projets.",
    stayHref: "/copilote",
    stayLabel: "Ouvrir le copilote",
    bindLabel: "Clé MCP Navpit",
  },
  Figma: {
    kind: "url",
    connectUrl: "https://www.figma.com",
    hint: "Colle le fichier Figma officiel du Focus.",
    stayHref: "/copilote?role=design",
    stayLabel: "Continuer avec le copilote design",
    bindLabel: "Fichier Figma",
    bindPlaceholder: "https://www.figma.com/design/…",
    linkField: "figma",
  },
  Canva: {
    kind: "url",
    connectUrl: "https://www.canva.com",
    hint: "Colle le design Canva officiel. Il se range dans Ressources.",
    stayHref: "/ressources",
    stayLabel: "Ouvrir les ressources",
    bindLabel: "Design Canva",
    bindPlaceholder: "https://www.canva.com/design/…",
  },
  Cursor: {
    kind: "mcp",
    connectUrl: "/copilote?role=tech",
    hint: "Une clé Navpit officielle dans Cursor : Focus, tâches, landings.",
    stayHref: "/copilote?role=tech",
    stayLabel: "Ouvrir le copilote tech",
    bindLabel: "Clé MCP Navpit",
  },
  "Claude Code": {
    kind: "mcp",
    connectUrl: "/copilote?role=tech",
    hint: "Même serveur MCP officiel. L’agent terminal reste sur Navpit.",
    stayHref: "/copilote?role=tech",
    stayLabel: "Ouvrir le copilote tech",
    bindLabel: "Clé MCP Navpit",
  },
  GitHub: {
    kind: "url",
    connectUrl: "https://github.com",
    hint: "Colle le repo GitHub officiel du Focus.",
    stayHref: "/copilote?role=tech",
    stayLabel: "Continuer avec le copilote tech",
    bindLabel: "Repo GitHub",
    bindPlaceholder: "https://github.com/toi/projet",
    linkField: "github",
    oauth: "github",
  },
  Vercel: {
    kind: "url",
    connectUrl: "https://vercel.com",
    hint: "Colle l’URL de prod Vercel. Elle devient le site à scorer.",
    stayHref: "/audit",
    stayLabel: "Scorer le site",
    bindLabel: "URL de prod",
    bindPlaceholder: "https://ton-app.vercel.app",
    linkField: "site",
  },
  Supabase: {
    kind: "url",
    connectUrl: "https://supabase.com/dashboard",
    hint: "Colle l’URL du projet Supabase officiel.",
    stayHref: "/schemas",
    stayLabel: "Générer le modèle de données",
    bindLabel: "Projet Supabase",
    bindPlaceholder: "https://xxxx.supabase.co",
  },
  Stripe: {
    kind: "secret",
    connectUrl: "https://dashboard.stripe.com/apikeys",
    hint: "Clé restreinte Stripe (rk_live_ ou rk_test_). Navpit vérifie le compte, ne garde pas la clé.",
    stayHref: "/copilote?role=launch",
    stayLabel: "Préparer le lancement",
    bindLabel: "Clé restreinte Stripe",
    bindPlaceholder: "rk_live_…",
  },
  Gmail: {
    kind: "oauth",
    connectUrl: "/api/connect/google?tools=gmail",
    hint: "Connecte Gmail via Google. Les mails se rédigent ensuite dans le copilote.",
    stayHref: "/copilote?role=launch",
    stayLabel: "Rédiger un mail",
    bindLabel: "Compte Gmail",
    bindPlaceholder: "toi@gmail.com",
    oauth: "google",
  },
  "Apple Calendar": {
    kind: "feed",
    connectUrl: "/accueil",
    hint: "Colle le flux iCal officiel (Calendrier → Partager). L’agenda se lit sur l’accueil.",
    stayHref: "/accueil",
    stayLabel: "Voir le planning",
    bindLabel: "Flux iCal",
    bindPlaceholder: "https://…/basic.ics",
  },
  "Google Drive": {
    kind: "oauth",
    connectUrl: "/api/connect/google?tools=drive",
    hint: "Connecte Drive via Google, ou colle un dossier officiel.",
    stayHref: "/ressources",
    stayLabel: "Ouvrir les ressources",
    bindLabel: "Dossier Drive",
    bindPlaceholder: "https://drive.google.com/drive/folders/…",
    oauth: "google",
  },
  TikTok: {
    kind: "url",
    connectUrl: "https://www.tiktok.com",
    hint: "Colle le profil TikTok officiel (@compte).",
    stayHref: "/copilote?role=launch",
    stayLabel: "Écrire un script",
    bindLabel: "Profil TikTok",
    bindPlaceholder: "@toncompte",
  },
  Instagram: {
    kind: "url",
    connectUrl: "https://www.instagram.com",
    hint: "Colle le profil Instagram officiel.",
    stayHref: "/copilote?role=launch",
    stayLabel: "Préparer un post",
    bindLabel: "Profil Instagram",
    bindPlaceholder: "@toncompte",
  },
  LinkedIn: {
    kind: "url",
    connectUrl: "https://www.linkedin.com",
    hint: "Colle le profil ou la page LinkedIn officielle.",
    stayHref: "/copilote?role=launch",
    stayLabel: "Écrire un post LinkedIn",
    bindLabel: "Profil LinkedIn",
    bindPlaceholder: "https://www.linkedin.com/in/…",
  },
  Gamma: {
    kind: "url",
    connectUrl: "https://gamma.app",
    hint: "Colle le deck Gamma officiel. Le tunnel se dessine ici.",
    stayHref: "/schemas",
    stayLabel: "Dessiner le tunnel",
    bindLabel: "Deck Gamma",
    bindPlaceholder: "https://gamma.app/docs/…",
  },
};

const FALLBACK: ConnectorMeta = {
  kind: "url",
  connectUrl: "/accueil",
  hint: "Colle l’URL officielle du compte. Le copilote le verra.",
  stayHref: "/copilote",
  stayLabel: "Ouvrir le copilote",
  bindLabel: "URL officielle",
  bindPlaceholder: "https://…",
};

export function connectorMeta(name: string): ConnectorMeta {
  return META[name] ?? FALLBACK;
}

export const MCP_TOOL_IDS = new Set(
  Object.entries(META)
    .filter(([, m]) => m.kind === "mcp")
    .map(([name]) => toolId(name)),
);

export function calendarToolId(provider: string) {
  if (provider.startsWith("Apple") || /google|agenda/i.test(provider)) {
    return toolId("Apple Calendar");
  }
  return null;
}

export type ConnectorTool = {
  id: string;
  name: string;
  url: string;
  desc: string;
  meta: ConnectorMeta;
};

export type ConnectorGroup = {
  id: string;
  label: string;
  icon: string;
  tools: ConnectorTool[];
};

export type ConnectorBind = {
  at: string;
  label: string;
};

export type ConnectorSignals = {
  connections: Record<string, ConnectorBind>;
  mcpReady: boolean;
  mcpUsed: boolean;
  calendarIds: string[];
  googleEmail: string | null;
  stripeBilling: boolean;
};

export function connectorGroups(groups: ToolGroup[] = TOOL_GROUPS): ConnectorGroup[] {
  return groups.map(([label, icon, tools]) => ({
    id: toolId(label),
    label,
    icon,
    tools: tools.map(([name, url, , desc]: Tool) => ({
      id: toolId(name),
      name,
      url,
      desc,
      meta: connectorMeta(name),
    })),
  }));
}

export function findTool(id: string) {
  return connectorGroups()
    .flatMap((g) => g.tools)
    .find((t) => t.id === id);
}

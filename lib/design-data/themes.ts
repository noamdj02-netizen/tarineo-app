// Généré par scripts/build-design-data.mjs depuis « Studio Noam.html ».
// Ne pas modifier à la main : relancer `npm run design-data`.

export type Theme = { id: string; n: string; f: string; fonts: string };

/** Les 6 thèmes (id, nom, pour quel projet, typos). */
export const THEMES: Theme[] = [
  {
    "id": "chantier",
    "n": "Chantier",
    "f": "Tarineo · B2B BTP, clair, rassurant",
    "fonts": "Archivo Black 900 / Archivo / JetBrains Mono"
  },
  {
    "id": "nuit",
    "n": "Nuit Pro",
    "f": "Devis Instant · dark premium fintech (WayPilot)",
    "fonts": "Instrument Serif / Geist / Geist Mono"
  },
  {
    "id": "encre",
    "n": "Encre",
    "f": "InkFlow · ticket dark, grille de points",
    "fonts": "Bebas Neue / DM Sans / JetBrains Mono"
  },
  {
    "id": "atelier",
    "n": "Atelier",
    "f": "Optérieur · sauge, bleu pétrole, terracotta, crème",
    "fonts": "Cormorant Garamond / Manrope"
  },
  {
    "id": "papier",
    "n": "Papier",
    "f": "Libre · minimal type Linear / Notion",
    "fonts": "Geist 600 serré / Geist Mono"
  },
  {
    "id": "aurora",
    "n": "Aurora",
    "f": "Libre · SaaS IA, verre et halos",
    "fonts": "Sora 700 / Sora"
  }
];

/** Variables CSS d'un thème, dans l'ordre d'origine. */
export const KIT_VARS = [
  "--k-bg",
  "--k-surface",
  "--k-text",
  "--k-muted",
  "--k-border",
  "--k-accent",
  "--k-ink",
  "--k-soft",
  "--k-hot",
  "--k-r",
  "--k-disp",
  "--k-dw",
  "--k-dls",
  "--k-body",
  "--k-mono",
  "--k-shadow",
  "--k-bgimg",
  "--k-up"
] as const;

/** Valeur de chaque variable, par thème. */
export const THEME_TOKENS: Record<string, Record<string, string>> = {
  "chantier": {
    "--k-bg": "#F6F7F9",
    "--k-surface": "#fff",
    "--k-text": "#0F1B2D",
    "--k-muted": "#5B6B80",
    "--k-border": "#DDE3EA",
    "--k-accent": "#1F5EFF",
    "--k-ink": "#fff",
    "--k-soft": "#E6EDFF",
    "--k-hot": "#FF7A1A",
    "--k-r": "10px",
    "--k-disp": "\"Archivo\",sans-serif",
    "--k-dw": "900",
    "--k-dls": "-.03em",
    "--k-body": "\"Archivo\",sans-serif",
    "--k-mono": "\"JetBrains Mono\",monospace",
    "--k-shadow": "0 1px 2px rgba(15,27,45,.06),0 8px 24px rgba(15,27,45,.08)",
    "--k-bgimg": "none",
    "--k-up": "none"
  },
  "nuit": {
    "--k-bg": "#05070D",
    "--k-surface": "#0E1320",
    "--k-text": "#EEF2FF",
    "--k-muted": "#8B93A7",
    "--k-border": "#1C2438",
    "--k-accent": "#3DDC97",
    "--k-ink": "#04130C",
    "--k-soft": "rgba(61,220,151,.12)",
    "--k-hot": "#3DDC97",
    "--k-r": "14px",
    "--k-disp": "\"Instrument Serif\",Georgia,serif",
    "--k-dw": "400",
    "--k-dls": "-.01em",
    "--k-body": "\"Geist\",sans-serif",
    "--k-mono": "\"Geist Mono\",monospace",
    "--k-shadow": "0 0 0 1px rgba(255,255,255,.04),0 20px 40px rgba(0,0,0,.4)",
    "--k-bgimg": "radial-gradient(60% 40% at 80% 0%,rgba(61,220,151,.12),transparent 70%)",
    "--k-up": "none"
  },
  "encre": {
    "--k-bg": "#0B0B0C",
    "--k-surface": "#151517",
    "--k-text": "#F2EFEA",
    "--k-muted": "#8E8A85",
    "--k-border": "#2A2A2D",
    "--k-accent": "#FF3B1F",
    "--k-ink": "#0B0B0C",
    "--k-soft": "rgba(255,59,31,.14)",
    "--k-hot": "#FF3B1F",
    "--k-r": "3px",
    "--k-disp": "\"Bebas Neue\",Impact,sans-serif",
    "--k-dw": "400",
    "--k-dls": ".01em",
    "--k-body": "\"DM Sans\",sans-serif",
    "--k-mono": "\"JetBrains Mono\",monospace",
    "--k-shadow": "none",
    "--k-bgimg": "radial-gradient(#2a2a2d 1px,transparent 1px)",
    "--k-up": "uppercase"
  },
  "atelier": {
    "--k-bg": "#F4EFE6",
    "--k-surface": "#FBF8F2",
    "--k-text": "#1F2B2E",
    "--k-muted": "#6B7470",
    "--k-border": "#E0D8CA",
    "--k-accent": "#1F4E5A",
    "--k-ink": "#fff",
    "--k-soft": "#E3EAE3",
    "--k-hot": "#C06A45",
    "--k-r": "2px",
    "--k-disp": "\"Cormorant Garamond\",Georgia,serif",
    "--k-dw": "600",
    "--k-dls": "-.01em",
    "--k-body": "\"Manrope\",sans-serif",
    "--k-mono": "\"JetBrains Mono\",monospace",
    "--k-shadow": "none",
    "--k-bgimg": "none",
    "--k-up": "none"
  },
  "papier": {
    "--k-bg": "#FAFAF7",
    "--k-surface": "#fff",
    "--k-text": "#111",
    "--k-muted": "#6B6B6B",
    "--k-border": "#E7E5E0",
    "--k-accent": "#111",
    "--k-ink": "#fff",
    "--k-soft": "#EFEEEA",
    "--k-hot": "#E5484D",
    "--k-r": "8px",
    "--k-disp": "\"Geist\",sans-serif",
    "--k-dw": "600",
    "--k-dls": "-.045em",
    "--k-body": "\"Geist\",sans-serif",
    "--k-mono": "\"Geist Mono\",monospace",
    "--k-shadow": "0 1px 0 #E7E5E0",
    "--k-bgimg": "none",
    "--k-up": "none"
  },
  "aurora": {
    "--k-bg": "#0A0620",
    "--k-surface": "rgba(255,255,255,.06)",
    "--k-text": "#F5F3FF",
    "--k-muted": "#A9A3C9",
    "--k-border": "rgba(255,255,255,.12)",
    "--k-accent": "#8B7CFF",
    "--k-ink": "#fff",
    "--k-soft": "rgba(139,124,255,.18)",
    "--k-hot": "#FF7AD9",
    "--k-r": "18px",
    "--k-disp": "\"Sora\",sans-serif",
    "--k-dw": "700",
    "--k-dls": "-.035em",
    "--k-body": "\"Sora\",sans-serif",
    "--k-mono": "\"JetBrains Mono\",monospace",
    "--k-shadow": "0 10px 40px rgba(80,60,200,.25)",
    "--k-bgimg": "radial-gradient(50% 50% at 15% 10%,rgba(139,124,255,.35),transparent 70%),radial-gradient(40% 40% at 90% 30%,rgba(255,122,217,.22),transparent 70%)",
    "--k-up": "none"
  }
};

/** Les 5 couleurs montrées en pastilles. */
export const SWATCH_VARS = ["--k-bg", "--k-surface", "--k-text", "--k-accent", "--k-hot"] as const;

export function swatches(id: string) {
  return SWATCH_VARS.map((v) => ({ v, c: THEME_TOKENS[id]?.[v] ?? "" }));
}

/** Bloc CSS des tokens d'un thème (même format que le bouton « Copier » d'origine). */
export function tokens(id: string) {
  const t = THEME_TOKENS[id] ?? {};
  return `.kit[data-kit="${id}"]{\n` + KIT_VARS.map((v) => `  ${v}:${t[v]};`).join("\n") + "\n}";
}

/** CSS complet du kit de composants (.kit, thèmes, .k-*). */
export const KIT_CSS = "/* ================= KIT (components themed) ================= */\n.kit{--k-bg:#F6F7F9;--k-surface:#fff;--k-text:#0F1B2D;--k-muted:#5B6B80;--k-border:#DDE3EA;--k-accent:#1F5EFF;--k-ink:#fff;--k-soft:#E6EDFF;--k-hot:#FF7A1A;--k-r:10px;--k-disp:\"Archivo\",sans-serif;--k-dw:900;--k-dls:-.03em;--k-body:\"Archivo\",sans-serif;--k-mono:\"JetBrains Mono\",monospace;--k-shadow:0 1px 2px rgba(15,27,45,.06),0 8px 24px rgba(15,27,45,.08);--k-bgimg:none;--k-up:none;\n  background:var(--k-bg);background-image:var(--k-bgimg);color:var(--k-text);font-family:var(--k-body);padding:22px 18px;font-size:15px;line-height:1.5}\n.kit[data-kit=\"encre\"]{--k-bg:#0B0B0C;--k-surface:#151517;--k-text:#F2EFEA;--k-muted:#8E8A85;--k-border:#2A2A2D;--k-accent:#FF3B1F;--k-ink:#0B0B0C;--k-soft:rgba(255,59,31,.14);--k-hot:#FF3B1F;--k-r:3px;--k-disp:\"Bebas Neue\",Impact,sans-serif;--k-dw:400;--k-dls:.01em;--k-body:\"DM Sans\",sans-serif;--k-up:uppercase;--k-shadow:none;--k-bgimg:radial-gradient(#2a2a2d 1px,transparent 1px);background-size:14px 14px}\n.kit[data-kit=\"nuit\"]{--k-bg:#05070D;--k-surface:#0E1320;--k-text:#EEF2FF;--k-muted:#8B93A7;--k-border:#1C2438;--k-accent:#3DDC97;--k-ink:#04130C;--k-soft:rgba(61,220,151,.12);--k-hot:#3DDC97;--k-r:14px;--k-disp:\"Instrument Serif\",Georgia,serif;--k-dw:400;--k-dls:-.01em;--k-body:\"Geist\",sans-serif;--k-mono:\"Geist Mono\",monospace;--k-shadow:0 0 0 1px rgba(255,255,255,.04),0 20px 40px rgba(0,0,0,.4);--k-bgimg:radial-gradient(60% 40% at 80% 0%,rgba(61,220,151,.12),transparent 70%)}\n.kit[data-kit=\"papier\"]{--k-bg:#FAFAF7;--k-surface:#fff;--k-text:#111;--k-muted:#6B6B6B;--k-border:#E7E5E0;--k-accent:#111;--k-ink:#fff;--k-soft:#EFEEEA;--k-hot:#E5484D;--k-r:8px;--k-disp:\"Geist\",sans-serif;--k-dw:600;--k-dls:-.045em;--k-body:\"Geist\",sans-serif;--k-mono:\"Geist Mono\",monospace;--k-shadow:0 1px 0 #E7E5E0}\n.kit[data-kit=\"aurora\"]{--k-bg:#0A0620;--k-surface:rgba(255,255,255,.06);--k-text:#F5F3FF;--k-muted:#A9A3C9;--k-border:rgba(255,255,255,.12);--k-accent:#8B7CFF;--k-ink:#fff;--k-soft:rgba(139,124,255,.18);--k-hot:#FF7AD9;--k-r:18px;--k-disp:\"Sora\",sans-serif;--k-dw:700;--k-dls:-.035em;--k-body:\"Sora\",sans-serif;--k-shadow:0 10px 40px rgba(80,60,200,.25);--k-bgimg:radial-gradient(50% 50% at 15% 10%,rgba(139,124,255,.35),transparent 70%),radial-gradient(40% 40% at 90% 30%,rgba(255,122,217,.22),transparent 70%)}\n.kit[data-kit=\"atelier\"]{--k-bg:#F4EFE6;--k-surface:#FBF8F2;--k-text:#1F2B2E;--k-muted:#6B7470;--k-border:#E0D8CA;--k-accent:#1F4E5A;--k-ink:#fff;--k-soft:#E3EAE3;--k-hot:#C06A45;--k-r:2px;--k-disp:\"Cormorant Garamond\",Georgia,serif;--k-dw:600;--k-dls:-.01em;--k-body:\"Manrope\",sans-serif;--k-shadow:none}\n.kit .lucide{width:18px;height:18px}\n.k-h{font-family:var(--k-disp);font-weight:var(--k-dw);letter-spacing:var(--k-dls);text-transform:var(--k-up);line-height:1.02;margin:0}\n.k-muted{color:var(--k-muted)}\n.k-mono{font-family:var(--k-mono)}\n.k-btn{display:inline-flex;align-items:center;gap:8px;border-radius:var(--k-r);padding:11px 18px;font:600 14.5px var(--k-body);border:1px solid transparent;cursor:pointer;text-decoration:none;transition:transform .15s,box-shadow .15s}\n.k-btn:hover{transform:translateY(-1px)}\n.k-primary{background:var(--k-accent);color:var(--k-ink);box-shadow:var(--k-shadow)}\n.k-second{background:var(--k-surface);color:var(--k-text);border-color:var(--k-border)}\n.k-ghost{background:transparent;color:var(--k-text)}\n.k-ghost:hover{background:var(--k-soft)}\n.k-row{display:flex;flex-wrap:wrap;gap:10px;align-items:center}\n.k-pill{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--k-border);background:var(--k-surface);border-radius:999px;padding:5px 12px 5px 5px;font-size:13px}\n.k-pill b{background:var(--k-accent);color:var(--k-ink);border-radius:999px;padding:2px 8px;font-size:11.5px}\n.k-nav{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 14px;border:1px solid var(--k-border);background:var(--k-surface);border-radius:calc(var(--k-r) + 6px);backdrop-filter:blur(10px)}\n.k-logo{display:flex;align-items:center;gap:8px;font:700 17px var(--k-disp);text-transform:var(--k-up);letter-spacing:var(--k-dls)}\n.k-logo i{width:24px;height:24px;border-radius:calc(var(--k-r) - 2px);background:var(--k-accent);display:block}\n.k-links{display:flex;gap:18px;font-size:14px;color:var(--k-muted)}\n@media (max-width:640px){.k-links{display:none}}\n.k-hero{display:grid;grid-template-columns:1.05fr .95fr;gap:24px;align-items:center}\n@media (max-width:760px){.k-hero{grid-template-columns:1fr}}\n.k-hero h2{font-size:clamp(34px,6vw,56px)}\n.k-hero p{font-size:17px;max-width:44ch}\n.k-proof{display:flex;align-items:center;gap:10px;font-size:13px}\n.k-avs{display:flex}.k-avs i{width:26px;height:26px;border-radius:50%;border:2px solid var(--k-bg);margin-left:-8px;display:block;background:var(--k-soft)}\n.k-avs i:first-child{margin-left:0}\n.k-card{background:var(--k-surface);border:1px solid var(--k-border);border-radius:calc(var(--k-r) + 4px);box-shadow:var(--k-shadow);padding:16px}\n.k-mock{display:flex;flex-direction:column;gap:10px}\n.k-line{display:grid;grid-template-columns:1fr auto auto;gap:10px;align-items:center;padding:9px 10px;border-radius:var(--k-r);font-size:13.5px;border:1px solid var(--k-border)}\n.k-up{color:var(--k-hot);font-family:var(--k-mono);font-weight:600}\n.k-okc{color:var(--k-muted);font-family:var(--k-mono)}\n.k-hl{background:var(--k-soft);border-color:var(--k-hot)}\n.k-marq{display:flex;gap:28px;flex-wrap:wrap;justify-content:center;align-items:center;color:var(--k-muted);font:700 17px var(--k-body);letter-spacing:.02em;opacity:.85}\n.k-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}\n@media (max-width:640px){.k-steps{grid-template-columns:1fr}}\n.k-step .k-num{font-family:var(--k-mono);font-size:12px;color:var(--k-accent)}\n.k-ico{width:38px;height:38px;border-radius:var(--k-r);background:var(--k-soft);color:var(--k-accent);display:grid;place-items:center;margin-bottom:8px}\n.k-bento{display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:minmax(120px,auto);gap:12px}\n.k-bento .big{grid-column:span 2;grid-row:span 2}.k-bento .wide{grid-column:span 2}\n@media (max-width:640px){.k-bento{grid-template-columns:1fr 1fr}.k-bento .big{grid-column:span 2;grid-row:auto}}\n.k-bento h4{margin:0 0 4px;font:600 16px var(--k-body)}\n.k-bento p{margin:0;font-size:13.5px;color:var(--k-muted)}\n.k-bignum{font:var(--k-dw) 44px var(--k-disp);letter-spacing:var(--k-dls);color:var(--k-accent)}\n.k-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}\n@media (max-width:640px){.k-stats{grid-template-columns:1fr}}\n.k-stat small{color:var(--k-muted);font-size:13px}\n.k-stat .v{font:var(--k-dw) 34px var(--k-disp);letter-spacing:var(--k-dls);display:block}\n.k-delta{font:600 12px var(--k-mono);color:var(--k-hot)}\n.k-toast{display:flex;gap:12px;align-items:flex-start;max-width:420px}\n.k-toast .k-ico{background:var(--k-hot);color:#fff;margin:0;flex:none}\n.k-quote{max-width:560px}\n.k-quote blockquote{margin:0 0 12px;font:400 19px/1.4 var(--k-disp);text-transform:none;letter-spacing:0}\n.kit[data-kit=\"encre\"] .k-quote blockquote{font-family:var(--k-body)}\n.k-who{display:flex;align-items:center;gap:10px;font-size:13.5px}\n.k-who i{width:36px;height:36px;border-radius:50%;background:var(--k-soft);display:block}\n.k-price{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;align-items:stretch}\n@media (max-width:760px){.k-price{grid-template-columns:1fr}}\n.k-plan{display:flex;flex-direction:column;gap:10px}\n.k-plan.pop{border:2px solid var(--k-accent);position:relative}\n.k-plan .tag{position:absolute;top:-11px;left:16px;background:var(--k-accent);color:var(--k-ink);font:600 11px var(--k-mono);padding:3px 8px;border-radius:99px}\n.k-plan .p{font:var(--k-dw) 40px var(--k-disp);letter-spacing:var(--k-dls)}\n.k-plan ul{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:6px;font-size:14px;flex:1}\n.k-plan li{display:flex;gap:8px;align-items:flex-start}\n.k-plan li .lucide{color:var(--k-accent);width:16px;height:16px;margin-top:3px}\n.k-faq details{border-bottom:1px solid var(--k-border);padding:12px 2px}\n.k-faq summary{cursor:pointer;font-weight:600;list-style:none;display:flex;justify-content:space-between;gap:10px}\n.k-faq summary::-webkit-details-marker{display:none}\n.k-faq details[open] summary .lucide{transform:rotate(45deg)}\n.k-faq p{margin:8px 0 0;color:var(--k-muted);font-size:14px}\n.k-cta{text-align:center;padding:30px 18px;border-radius:calc(var(--k-r) + 8px);background:var(--k-accent);color:var(--k-ink)}\n.k-cta h2{font-size:clamp(28px,5vw,42px)}\n.k-cta .k-btn{background:var(--k-ink);color:var(--k-accent)}\n.k-form{display:flex;gap:8px;flex-wrap:wrap;max-width:460px}\n.k-form input{flex:1;min-width:0;border:1px solid var(--k-border);background:var(--k-surface);color:var(--k-text);border-radius:var(--k-r);padding:11px 12px;font:14.5px var(--k-body)}\n.k-foot{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:16px;font-size:13.5px}\n.k-foot h5{margin:0 0 8px;font:600 12px var(--k-mono);text-transform:uppercase;letter-spacing:.06em;color:var(--k-muted)}\n.k-foot a{display:block;color:var(--k-text);text-decoration:none;padding:2px 0}\n@media (max-width:640px){.k-foot{grid-template-columns:1fr 1fr}}\n";

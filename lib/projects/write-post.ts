import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { DEFAULT_MODEL, isModelId, type ModelId } from "@/lib/models";
import { MARKET_CHANNELS, type MarketChannel } from "./marketing";

export async function writeMarketingPost(input: {
  name: string;
  pitch?: string;
  target?: string;
  problem?: string;
  offer?: string;
  hook?: string;
  cta?: string;
  channel?: MarketChannel | string;
  model?: string;
  signal?: AbortSignal;
}): Promise<string> {
  const canal =
    MARKET_CHANNELS.find((c) => c.id === input.channel)?.n ?? input.channel ?? "LinkedIn";
  const fallback = [
    input.hook?.trim(),
    input.offer?.trim(),
    input.cta?.trim() ? `${input.cta.trim()}. ${input.name}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
  const seed =
    fallback ||
    [input.pitch?.trim(), input.problem?.trim(), input.name].filter(Boolean).join("\n") ||
    input.name;

  if (!process.env.ANTHROPIC_API_KEY) return seed.slice(0, 2000);

  const client = new Anthropic();
  const model: ModelId = isModelId(input.model) ? input.model : DEFAULT_MODEL;
  const res = await client.messages.create(
    {
      model,
      max_tokens: 500,
      system:
        "Rédacteur FR. 8 lignes max. Copy réelle, ancrée au projet. Pas d’emoji, pas d’em-dash, pas de lorem, pas de Relais générique.",
      messages: [
        {
          role: "user",
          content: [
            `Projet ${input.name}. Canal ${canal}.`,
            input.target ? `Cible : ${input.target}.` : "",
            input.pitch ? `Pitch : ${input.pitch}.` : "",
            input.problem ? `Problème : ${input.problem}.` : "",
            input.offer ? `Offre : ${input.offer}.` : "",
            input.hook ? `Hook : ${input.hook}.` : "",
            input.cta ? `CTA : ${input.cta}.` : "",
            "Rédige UN post prêt à coller. Rien d’autre.",
          ]
            .filter(Boolean)
            .join(" "),
        },
      ],
    },
    { signal: input.signal },
  );
  const block = res.content.find((b) => b.type === "text");
  const text = block && block.type === "text" ? block.text.trim() : "";
  return (text || seed).slice(0, 2000);
}

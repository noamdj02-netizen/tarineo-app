import { ActionCards, type ActionCard } from "@/components/home/action-cards";
import { GlowCard } from "@/components/home/glow-card";
import { PromptBox } from "@/components/home/prompt-box";
import { Reveal, RevealGroup } from "@/components/motion/reveal";
import { getDb } from "@/lib/db";
import { getViewer } from "@/lib/session";

export const metadata = { title: "Accueil" };

async function getFocusProject() {
  const db = await getDb();
  if (!db) return null;
  const { data } = await db.supabase
    .from("projects")
    .select("slug, name, next")
    .eq("user_id", db.user.id)
    .eq("status", "focus")
    .order("sort_order")
    .limit(1)
    .maybeSingle();
  return data;
}

const SUGGESTIONS = [
  "Quelle est ma prochaine action ?",
  "Écris le prompt Cursor pour mon hero",
  "Quel thème pour mon projet ?",
  "Comment trouver mes 10 premiers clients ?",
];

export default async function AccueilPage() {
  const [viewer, focus] = await Promise.all([getViewer(), getFocusProject()]);

  const cards: ActionCard[] = [
    focus
      ? {
          n: "01",
          label: "Projet en Focus",
          title: `Continuer ${focus.name}`,
          text:
            focus.next || "Ouvre la fiche pour choisir ta prochaine action.",
          href: `/projets/${focus.slug}`,
          icon: "rocket",
        }
      : {
          n: "01",
          label: "Projets",
          title: "Choisir ton projet en Focus",
          text: "Un seul projet à la fois, jusqu’à sa première vente.",
          href: "/projets",
          icon: "rocket",
        },
    {
      n: "02",
      label: "Anatomie",
      title: "Checklist avant lancement",
      text: "Les 12 frames d’une landing qui convertit, à cocher une par une.",
      href: "/anatomie",
      icon: "check",
    },
    {
      n: "03",
      label: "Thèmes",
      title: "Choisir un thème",
      text: "Couleurs, typos et arrondis prêts à copier dans ton projet.",
      href: "/themes",
      icon: "palette",
    },
  ];

  return (
    <RevealGroup className="mx-auto flex max-w-[760px] flex-col gap-8 pt-[1vh] pb-4 sm:pt-[4vh]">
      <Reveal>
        <GlowCard
          tilt
          className="flex min-h-[min(72dvh,600px)] flex-col px-5 pt-8 pb-5 sm:px-10 sm:pt-12 sm:pb-8"
        >
          <p className="font-grotesk text-[13px] font-bold tracking-[0.16em] text-ink/75 uppercase">
            Bonjour{viewer?.firstName ? ` ${viewer.firstName}` : ""} !
          </p>
          <h1 className="mt-3 max-w-[15ch] font-display text-[clamp(32px,6.4vw,52px)] leading-[1.04] font-semibold tracking-tightest text-balance">
            Comment puis-je t’aider aujourd’hui ?
          </h1>
          <PromptBox suggestions={SUGGESTIONS} className="mt-7 flex-1" />
        </GlowCard>
      </Reveal>

      <div className="flex flex-col gap-3">
        <Reveal>
          <p className="mono-label">{"/ Actions rapides ///"}</p>
        </Reveal>
        <ActionCards cards={cards} />
      </div>
    </RevealGroup>
  );
}

import { ActionCards, type ActionCard } from "@/components/home/action-cards";
import { PromptBox } from "@/components/home/prompt-box";
import { Illustration } from "@/components/illustration";
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
          text: focus.next || "Ouvre la fiche pour choisir ta prochaine action.",
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
    <RevealGroup className="mx-auto flex max-w-[760px] flex-col gap-8 pt-[4vh] pb-4 sm:pt-[8vh]">
      <div className="flex flex-col items-center gap-3 text-center">
        <Reveal>
          <Illustration name="dashboard-au-travail" className="-mb-2 size-20 sm:size-24" />
        </Reveal>
        <Reveal>
          <p className="mono-label">{"/ Cockpit ///"}</p>
        </Reveal>
        <Reveal>
          <h1 className="font-display text-[clamp(34px,7vw,56px)] leading-[1.02] font-semibold tracking-tightest text-balance">
            Bon retour
            {viewer?.firstName ? (
              <>
                ,<span className="text-accent-2"> {viewer.firstName}</span>
              </>
            ) : null}
            <span className="text-accent-2">.</span>
          </h1>
        </Reveal>
        <Reveal>
          <p className="max-w-[46ch] text-[15.5px] text-muted">
            Une question, une action. Ton copilote connaît tes projets.
          </p>
        </Reveal>
      </div>

      <Reveal>
        <PromptBox suggestions={SUGGESTIONS} />
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

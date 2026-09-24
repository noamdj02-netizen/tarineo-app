import { ArrowUpRight, Globe, Lock, Sparkles, Workflow, Zap } from "lucide-react";
import { Avatar, Bars } from "./shared";

const LIME = "#d4f36b";

export function BentoPreview() {
  return (
    <div className="bg-[#efefec] p-5 font-sans text-[#121212]">
      <nav className="flex items-center justify-between rounded-[22px] bg-white px-7 py-4 text-[15px]">
        <span className="flex items-center gap-2 text-[19px] font-bold tracking-[-0.04em]">
          <i className="grid size-7 grid-cols-2 gap-0.5">
            <b className="rounded-[3px] bg-black" />
            <b className="rounded-[3px]" style={{ background: LIME }} />
            <b className="rounded-[3px]" style={{ background: LIME }} />
            <b className="rounded-[3px] bg-black" />
          </i>
          Blocks
        </span>
        <span className="flex gap-8 text-black/55">
          <span>Features</span>
          <span>Integrations</span>
          <span>Pricing</span>
        </span>
        <span className="rounded-full bg-black px-5 py-2.5 font-medium text-white">Try Blocks</span>
      </nav>

      <div className="mt-3 grid grid-cols-4 grid-rows-[340px_280px] gap-3">
        <header className="col-span-3 flex flex-col justify-between rounded-[22px] bg-white p-10">
          <span className="w-fit rounded-full bg-black/[0.05] px-3.5 py-1.5 text-[13px] font-medium">Workspace OS · 2026</span>
          <div>
            <h1 className="text-[92px] leading-[0.9] font-bold tracking-[-0.06em]">
              Your whole team,
              <br />
              one board.
            </h1>
            <div className="mt-6 flex items-center gap-6">
              <span className="flex items-center gap-2 rounded-full bg-black px-6 py-3.5 text-[16px] font-medium text-white">
                Start free <ArrowUpRight className="size-4" />
              </span>
              <span className="text-[15px] text-black/50">Docs, tasks and data — in blocks you rearrange.</span>
            </div>
          </div>
        </header>
        <div className="flex flex-col justify-between rounded-[22px] p-8" style={{ background: LIME }}>
          <Sparkles className="size-7" />
          <div>
            <p className="text-[72px] leading-none font-bold tracking-[-0.06em]">3×</p>
            <p className="mt-2 text-[15px] font-medium">faster weekly planning</p>
          </div>
        </div>

        <div className="col-span-2 rounded-[22px] bg-black p-7 text-white">
          <div className="flex items-center justify-between">
            <p className="text-[15px] font-medium">Team velocity</p>
            <span className="rounded-full bg-white/10 px-3 py-1 text-[12px]">Last 12 weeks</span>
          </div>
          <Bars
            className="mt-6 h-[170px]"
            values={[40, 52, 46, 60, 58, 72, 64, 78, 70, 86, 82, 96]}
            barClass="bg-white/15"
            activeIndex={11}
            activeClass="bg-[#d4f36b]"
          />
        </div>
        <div className="flex flex-col justify-between rounded-[22px] bg-white p-7">
          <div className="flex -space-x-3">
            {[10, 60, 200, 280].map((h) => (
              <Avatar key={h} hue={h} className="size-12 ring-4 ring-white" />
            ))}
          </div>
          <div>
            <p className="text-[44px] font-bold tracking-[-0.05em]">12k+</p>
            <p className="text-[15px] text-black/50">teams moved in this year</p>
          </div>
        </div>
        <div className="flex flex-col justify-between rounded-[22px] bg-white p-7">
          <Zap className="size-7" />
          <p className="text-[24px] leading-tight font-semibold tracking-[-0.04em]">Automations that write themselves.</p>
        </div>
      </div>

      <section className="px-5 pt-24 pb-10">
        <h2 className="max-w-[16ch] text-[56px] leading-[0.96] font-bold tracking-[-0.055em]">Every block does one thing well.</h2>
      </section>
      <div className="grid grid-cols-3 gap-3">
        {[
          [Workflow, "Flows", "Trigger, route and review work without code.", "bg-white"],
          [Globe, "Publish", "Turn any board into a public page in one click.", "bg-white"],
          [Lock, "Permissions", "Per-block access, down to the field.", "bg-black text-white"],
        ].map(([Icon, t, d, c]) => {
          const I = Icon as typeof Zap;
          return (
            <div key={t as string} className={`rounded-[22px] p-8 ${c as string}`}>
              <I className="size-7" />
              <h3 className="mt-16 text-[28px] font-bold tracking-[-0.045em]">{t as string}</h3>
              <p className="mt-2 text-[15.5px] leading-relaxed opacity-60">{d as string}</p>
            </div>
          );
        })}
      </div>

      <section className="mt-3 grid grid-cols-[1.4fr_1fr] gap-3">
        <div className="rounded-[22px] bg-white p-8">
          <div className="grid grid-cols-3 gap-3">
            {["Roadmap", "Sprint 14", "Hiring", "Launch", "Research", "Budget"].map((t, i) => (
              <div key={t} className="rounded-2xl border border-black/[0.07] p-4">
                <i className="block h-2 w-10 rounded-full" style={{ background: i % 3 === 0 ? LIME : "#e5e5e1" }} />
                <p className="mt-6 text-[15px] font-semibold">{t}</p>
                <p className="text-[12.5px] text-black/40">{4 + i} blocks</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col justify-between rounded-[22px] p-10" style={{ background: LIME }}>
          <h2 className="text-[48px] leading-[0.95] font-bold tracking-[-0.055em]">Build your first board today.</h2>
          <span className="w-fit rounded-full bg-black px-6 py-3.5 text-[16px] font-medium text-white">Start free</span>
        </div>
      </section>
    </div>
  );
}

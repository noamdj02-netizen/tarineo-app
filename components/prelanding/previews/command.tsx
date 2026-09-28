import { Activity, Command as CommandIcon, Compass, Layers, Radar, Target } from "lucide-react";

const GRID = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
  backgroundSize: "40px 40px",
} as const;

function Label({ children, className }: { children: string; className?: string }) {
  return (
    <p className={`font-mono text-[11px] tracking-[0.14em] text-white/40 uppercase ${className ?? ""}`}>
      {`/ ${children} ///`}
    </p>
  );
}

function Panel({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[18px] border border-white/[0.08] bg-[#151515] p-5 ${className ?? ""}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

export function CommandPreview() {
  return (
    <div className="bg-[#0c0c0c] font-sans text-[#f3f3f2]">
      <nav className="flex items-center justify-between border-b border-white/[0.07] px-16 py-5 text-[14.5px]">
        <span className="font-serif text-[28px] leading-none">Helm</span>
        <span className="flex gap-9 font-mono text-[12.5px] tracking-[0.1em] text-white/45 uppercase">
          <span>Cockpit</span>
          <span>Routes</span>
          <span>Signals</span>
          <span>Pricing</span>
        </span>
        <span className="rounded-full bg-[#f3f3f2] px-5 py-2.5 font-semibold text-[#111]">Open cockpit</span>
      </nav>

      <header className="grid grid-cols-[1fr_auto] items-end gap-10 px-16 pt-16 pb-12">
        <div>
          <Label>Control center</Label>
          <h1 className="mt-5 text-[84px] leading-[0.92] font-bold tracking-[-0.055em]">
            Every project,
            <br />
            <span className="text-white/35">one flight deck.</span>
          </h1>
        </div>
        <div className="max-w-[330px] pb-2">
          <p className="text-[16.5px] leading-relaxed text-white/50">
            See where each project is heading, what is drifting and what to do next — from one
            screen.
          </p>
          <span className="mt-6 flex items-center justify-between rounded-full border border-white/12 bg-white/[0.04] py-2.5 pr-2.5 pl-5 text-[14px] text-white/45">
            Jump to anything…
            <span className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 font-mono text-[12px] text-white/70">
              <CommandIcon className="size-3" />K
            </span>
          </span>
        </div>
      </header>

      <div className="mx-10 overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#101010] p-4" style={GRID}>
        <div className="grid grid-cols-[180px_1fr_300px] gap-4">
          <aside className="flex flex-col gap-1 rounded-[18px] bg-black p-4 text-[13.5px]">
            <span className="mb-4 font-serif text-[22px]">Helm</span>
            {[
              [Compass, "Cockpit"],
              [Target, "Missions"],
              [Layers, "Routes"],
              [Radar, "Signals"],
              [Activity, "Logbook"],
            ].map(([Icon, l], i) => {
              const I = Icon as typeof Compass;
              return (
                <span
                  key={l as string}
                  className={i === 0 ? "flex items-center gap-2.5 rounded-xl bg-white/10 px-3 py-2" : "flex items-center gap-2.5 px-3 py-2 text-white/45"}
                >
                  <I className="size-4" /> {l as string}
                </span>
              );
            })}
          </aside>

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-4">
              {[
                ["Active routes", "07", "2 drifting"],
                ["On course", "82%", "+6 this week"],
                ["Next arrival", "4d", "Launch · v2"],
              ].map(([k, v, d]) => (
                <Panel key={k} label={k}>
                  <p className="mt-3 text-[40px] leading-none font-bold tracking-[-0.05em]">{v}</p>
                  <p className="mt-2 text-[12.5px] text-white/45">{d}</p>
                </Panel>
              ))}
            </div>
            <Panel label="Trajectories" className="relative h-[260px]">
              <svg viewBox="0 0 600 200" className="absolute inset-x-5 bottom-4 h-[200px] w-[calc(100%-40px)]" fill="none">
                <path d="M0 170 C 120 160, 180 90, 300 80 S 480 30, 600 20" stroke="#f3f3f2" strokeWidth="2" />
                <path d="M0 180 C 140 175, 220 140, 330 130 S 500 110, 600 100" stroke="rgba(255,255,255,.35)" strokeWidth="1.5" strokeDasharray="5 6" />
                <path d="M0 190 C 160 188, 260 175, 360 170 S 520 160, 600 150" stroke="rgba(255,255,255,.18)" strokeWidth="1.5" />
                <circle cx="300" cy="80" r="5" fill="#f3f3f2" />
                <circle cx="300" cy="80" r="12" stroke="rgba(255,255,255,.3)" />
                <circle cx="330" cy="130" r="4" fill="rgba(255,255,255,.5)" />
              </svg>
              <span className="absolute top-[88px] left-[52%] rounded-full bg-[#f3f3f2] px-3 py-1 text-[12px] font-semibold text-[#111]">
                TARINEO · on course
              </span>
            </Panel>
          </div>

          <div className="flex flex-col gap-4">
            <Panel label="Next actions">
              <div className="mt-3 flex flex-col gap-2 text-[13.5px]">
                {["Ship pricing page", "Reply to 3 beta users", "Record demo video", "Fix onboarding step 2"].map((t, i) => (
                  <span key={t} className="flex items-center gap-2.5 rounded-xl bg-white/[0.04] px-3 py-2.5">
                    <i className={i === 0 ? "block size-3.5 rounded-full bg-[#f3f3f2]" : "block size-3.5 rounded-full border border-white/30"} />
                    {t}
                  </span>
                ))}
              </div>
            </Panel>
            <Panel label="Signals" className="flex-1">
              <div className="mt-3 flex flex-col gap-3 font-mono text-[12px] text-white/55">
                <span>09:12 · 14 new signups</span>
                <span>10:40 · churn alert — Studio plan</span>
                <span>11:05 · deploy #218 green</span>
              </div>
            </Panel>
          </div>
        </div>
      </div>

      <section className="grid grid-cols-3 gap-4 px-16 py-24">
        {[
          ["01", "Plot", "Give each project a destination and a date. Helm draws the route."],
          ["02", "Watch", "Signals from your tools flag drift before it becomes a delay."],
          ["03", "Act", "One next action per project, always in view. ⌘K for the rest."],
        ].map(([n, t, d]) => (
          <div key={n} className="rounded-[18px] border border-white/[0.08] p-7">
            <p className="font-mono text-[12px] text-white/35">{n}</p>
            <h3 className="mt-10 text-[30px] font-bold tracking-[-0.045em]">{t}</h3>
            <p className="mt-2 text-[15.5px] leading-relaxed text-white/50">{d}</p>
          </div>
        ))}
      </section>

      <section className="border-t border-white/[0.07] px-16 py-24 text-center" style={GRID}>
        <Label>Ready for takeoff</Label>
        <h2 className="mt-5 text-[60px] leading-[0.95] font-bold tracking-[-0.055em]">
          Take the helm. <span className="text-white/35">Today.</span>
        </h2>
        <span className="mt-9 inline-block rounded-full bg-[#f3f3f2] px-8 py-4 text-[16px] font-semibold text-[#111]">
          Open cockpit
        </span>
      </section>
    </div>
  );
}

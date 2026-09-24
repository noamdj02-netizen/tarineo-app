import { Search } from "lucide-react";
import { AppWindow, Avatar } from "./shared";

const COLS = [
  { t: "Backlog", c: "#b8b8b0", n: ["Pricing page copy", "Import from CSV", "Dark mode tokens"] },
  { t: "In progress", c: "#f0a33a", n: ["Checkout redesign", "Team invites"] },
  { t: "Review", c: "#6b8cff", n: ["Onboarding emails", "Mobile nav"] },
  { t: "Done", c: "#3fb37f", n: ["Billing portal", "Webhooks v2", "SSO"] },
];

export function ProductFirstPreview() {
  return (
    <div className="bg-[#f7f7f5] font-sans text-[#111]">
      <nav className="flex items-center justify-between px-16 py-5 text-[14.5px]">
        <span className="text-[18px] font-semibold tracking-[-0.03em]">Kanso</span>
        <span className="flex gap-8 text-black/50">
          <span>Product</span>
          <span>Pricing</span>
          <span>Changelog</span>
        </span>
        <span className="rounded-lg bg-[#111] px-4 py-2 font-medium text-white">Get Kanso</span>
      </nav>

      <header className="flex items-end justify-between px-16 pt-8 pb-10">
        <h1 className="text-[56px] leading-none font-semibold tracking-[-0.05em]">
          Projects, without the overhead.
        </h1>
        <span className="rounded-lg bg-[#111] px-6 py-3.5 text-[15px] font-medium text-white">Try it free</span>
      </header>

      <div className="px-10">
        <AppWindow className="shadow-[0_40px_100px_-40px_rgba(0,0,0,0.35)]" url="kanso.app/acme/sprint-14">
          <div className="grid grid-cols-[220px_1fr]">
            <aside className="flex flex-col gap-1 border-r border-black/[0.06] bg-[#fbfbfa] p-4 text-[13.5px]">
              <span className="mb-3 flex items-center gap-2 rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-black/40">
                <Search className="size-3.5" /> Search
              </span>
              {["Inbox", "My issues", "Sprint 14", "Roadmap", "Docs"].map((l, i) => (
                <span
                  key={l}
                  className={i === 2 ? "rounded-md bg-black/[0.06] px-3 py-1.5 font-medium" : "px-3 py-1.5 text-black/55"}
                >
                  {l}
                </span>
              ))}
              <p className="mt-5 px-3 text-[11px] tracking-[0.1em] text-black/35 uppercase">Teams</p>
              {["Web", "Mobile", "Growth"].map((l) => (
                <span key={l} className="px-3 py-1.5 text-black/55">{l}</span>
              ))}
            </aside>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-[20px] font-semibold tracking-[-0.03em]">Sprint 14</p>
                <div className="flex -space-x-2">
                  {[30, 120, 210].map((h) => (
                    <Avatar key={h} hue={h} className="size-7 ring-2 ring-white" />
                  ))}
                </div>
              </div>
              <div className="mt-5 grid grid-cols-4 gap-4">
                {COLS.map((col) => (
                  <div key={col.t} className="rounded-xl bg-[#f4f4f2] p-3">
                    <p className="flex items-center gap-2 px-1 text-[13px] font-medium">
                      <i className="block size-2 rounded-full" style={{ background: col.c }} />
                      {col.t}
                      <span className="text-black/35">{col.n.length}</span>
                    </p>
                    <div className="mt-3 flex flex-col gap-2">
                      {col.n.map((n, i) => (
                        <div key={n} className="rounded-lg border border-black/[0.06] bg-white p-3">
                          <p className="text-[13.5px] font-medium">{n}</p>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="font-mono text-[11px] text-black/35">KAN-{120 + i * 7 + col.t.length}</span>
                            <Avatar hue={i * 90 + col.t.length * 20} className="size-5" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AppWindow>
      </div>

      <section className="grid grid-cols-4 gap-8 px-16 py-20">
        {[
          ["Keyboard-first", "Every action is two keys away."],
          ["Real-time", "See changes as teammates type."],
          ["Offline", "Works on the train, syncs later."],
          ["Integrations", "GitHub, Slack, Figma built in."],
        ].map(([t, d]) => (
          <div key={t} className="border-t border-black/15 pt-5">
            <h3 className="text-[18px] font-semibold tracking-[-0.03em]">{t}</h3>
            <p className="mt-1.5 text-[15px] text-black/50">{d}</p>
          </div>
        ))}
      </section>

      <section className="flex items-center justify-between border-t border-black/[0.07] px-16 py-16">
        <h2 className="text-[40px] font-semibold tracking-[-0.045em]">See it with your own projects.</h2>
        <span className="rounded-lg bg-[#111] px-6 py-3.5 text-[15px] font-medium text-white">Try it free</span>
      </section>
    </div>
  );
}

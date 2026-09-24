import { ArrowRight, AudioLines, FileText, Image as ImageIcon, Mail } from "lucide-react";

const VIOLET = "#8f7bff";

function Satellite({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span
      className={`absolute flex items-center gap-2.5 rounded-full border border-white/10 bg-[#15151c] py-2 pr-4 pl-2 text-[13px] text-white/75 ${className}`}
    >
      {children}
    </span>
  );
}

export function OrbitPreview() {
  return (
    <div className="bg-[#0b0b10] font-sans text-white">
      <nav className="flex items-center justify-between px-16 py-6 text-[15px]">
        <span className="flex items-center gap-2.5 text-[18px] font-medium tracking-[-0.02em]">
          <i className="relative block size-6 rounded-full border border-white/40">
            <b className="absolute -top-0.5 left-1/2 block size-2 -translate-x-1/2 rounded-full bg-white" />
          </i>
          Orbit
        </span>
        <span className="flex gap-9 text-white/45">
          <span>Models</span>
          <span>Research</span>
          <span>API</span>
          <span>Pricing</span>
        </span>
        <span className="rounded-full bg-white px-5 py-2.5 font-medium text-black">Try Orbit</span>
      </nav>

      <header className="relative flex flex-col items-center overflow-hidden px-16 pt-16 pb-24 text-center">
        <div
          className="pointer-events-none absolute top-[260px] left-1/2 size-[900px] -translate-x-1/2 rounded-full opacity-40"
          style={{ background: `radial-gradient(closest-side, ${VIOLET}33, transparent)` }}
        />
        <p className="relative text-[12.5px] tracking-[0.2em] text-white/45 uppercase">One assistant · every format</p>
        <h1 className="relative mt-6 max-w-[14ch] text-[80px] leading-[0.96] font-medium tracking-[-0.05em]">
          Ask once. Orbit handles the rest.
        </h1>
        <p className="relative mt-6 max-w-[48ch] text-[18px] leading-relaxed text-white/50">
          An AI that reads your docs, drafts your mail and briefs your meetings, then waits for your
          go.
        </p>

        <div className="relative mt-12 grid size-[520px] place-items-center">
          {[520, 380, 240].map((s, i) => (
            <i
              key={s}
              className="absolute block rounded-full border border-white/[0.09]"
              style={{ width: s, height: s, transform: `rotate(${i * 25}deg)` }}
            >
              <b
                className="absolute top-1/2 -left-[3px] block size-1.5 rounded-full"
                style={{ background: i === 1 ? VIOLET : "rgba(255,255,255,.5)" }}
              />
            </i>
          ))}
          <div className="relative w-[300px] rounded-2xl border border-white/12 bg-[#14141b] p-4 text-left shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
            <p className="text-[12px] text-white/40">Orbit</p>
            <p className="mt-2 text-[14.5px] leading-relaxed text-white/85">
              Summarised 14 threads. Three need you today — want the drafts?
            </p>
            <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-[13px] text-white/40">
              Ask anything…
              <span className="grid size-7 place-items-center rounded-lg bg-white text-black">
                <ArrowRight className="size-3.5" />
              </span>
            </div>
          </div>
          <Satellite className="top-[40px] left-[20px]">
            <Mail className="size-6 rounded-full bg-white/10 p-1.5" /> Inbox
          </Satellite>
          <Satellite className="top-[110px] right-[-10px]">
            <FileText className="size-6 rounded-full bg-white/10 p-1.5" /> Q3 report.pdf
          </Satellite>
          <Satellite className="bottom-[70px] left-[-20px]">
            <AudioLines className="size-6 rounded-full bg-white/10 p-1.5" /> Standup, 9:30
          </Satellite>
          <Satellite className="right-[30px] bottom-[20px]">
            <ImageIcon className="size-6 rounded-full bg-white/10 p-1.5" /> Moodboard
          </Satellite>
        </div>
      </header>

      <section className="grid grid-cols-3 gap-px border-y border-white/[0.07] bg-white/[0.07]">
        {[
          ["Reads", "Docs, sheets, PDFs and calls. Private by default."],
          ["Drafts", "Mail and briefs in your voice, never sent without you."],
          ["Remembers", "Context carries over, across tools and weeks."],
        ].map(([t, d]) => (
          <div key={t} className="bg-[#0b0b10] px-14 py-14">
            <i className="block size-2 rounded-full" style={{ background: VIOLET }} />
            <h3 className="mt-8 text-[30px] font-medium tracking-[-0.04em]">{t}</h3>
            <p className="mt-3 text-[15.5px] leading-relaxed text-white/50">{d}</p>
          </div>
        ))}
      </section>

      <section className="px-16 py-24 text-center">
        <p className="text-[13px] text-white/40">Connected to the tools you already use</p>
        <div className="mt-6 flex justify-center gap-4">
          {["Gmail", "Notion", "Slack", "Drive", "Linear", "Zoom"].map((t) => (
            <span key={t} className="rounded-full border border-white/10 px-5 py-2.5 text-[14px] text-white/65">
              {t}
            </span>
          ))}
        </div>
      </section>

      <section className="px-16 pb-24 text-center">
        <h2 className="text-[56px] font-medium tracking-[-0.05em]">Put your work in orbit.</h2>
        <span className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[16px] font-medium text-black">
          Try Orbit free <ArrowRight className="size-4" />
        </span>
      </section>
    </div>
  );
}

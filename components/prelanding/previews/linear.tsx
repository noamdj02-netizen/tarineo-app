export function LinearPreview() {
  return (
    <div className="bg-[#fbfbfa] font-sans text-[#141414]">
      <nav className="flex items-center justify-between border-b border-black/[0.07] px-20 py-6 text-[14px]">
        <span className="text-[16px] font-semibold tracking-[-0.02em]">Lineal</span>
        <span className="flex gap-10 text-black/45">
          <span>Method</span>
          <span>Changelog</span>
          <span>Pricing</span>
        </span>
        <span className="border-b border-black pb-0.5">Get access</span>
      </nav>

      <header className="px-20 pt-40 pb-32">
        <p className="text-[12px] tracking-[0.22em] text-black/40 uppercase">Issue tracking, reduced</p>
        <h1 className="mt-8 text-[128px] leading-[0.9] font-semibold tracking-[-0.065em]">
          Less tool.
          <br />
          <span className="text-black/25">More work.</span>
        </h1>
        <div className="mt-16 flex items-end justify-between border-t border-black/[0.09] pt-8">
          <p className="max-w-[40ch] text-[18px] leading-relaxed text-black/50">
            A tracker with nothing to configure. Write the task, ship it, move on.
          </p>
          <span className="flex items-center gap-8 text-[15px]">
            <span className="text-black/40">⌘ + K anywhere</span>
            <span className="bg-[#141414] px-7 py-4 text-white">Request access</span>
          </span>
        </div>
      </header>

      <section className="grid grid-cols-3 border-y border-black/[0.09]">
        {[
          ["01", "Write", "Type a task the way you would say it. Lineal files it."],
          ["02", "Focus", "One list per day. Everything else stays folded."],
          ["03", "Ship", "Close the loop with a keystroke. No status meetings."],
        ].map(([n, t, d], i) => (
          <div key={n} className={i ? "border-l border-black/[0.09] px-12 py-16" : "px-12 py-16 pl-20"}>
            <p className="font-mono text-[12px] text-black/35">{n}</p>
            <h3 className="mt-10 text-[34px] font-semibold tracking-[-0.045em]">{t}</h3>
            <p className="mt-3 text-[16px] leading-relaxed text-black/50">{d}</p>
          </div>
        ))}
      </section>

      <section className="px-20 py-32">
        <div className="border border-black/[0.09] bg-white">
          {[
            ["LIN-204", "Rewrite onboarding copy", "Today", true],
            ["LIN-203", "Fix date picker on Safari", "Today", false],
            ["LIN-198", "Ship keyboard shortcuts sheet", "Tue", false],
            ["LIN-191", "Archive old projects automatically", "Thu", false],
          ].map(([id, t, d, done]) => (
            <div key={id as string} className="flex items-center gap-8 border-b border-black/[0.06] px-8 py-5 text-[15px] last:border-0">
              <span className={done ? "size-3.5 rounded-full bg-black" : "size-3.5 rounded-full border border-black/30"} />
              <span className="w-20 font-mono text-[12.5px] text-black/35">{id as string}</span>
              <span className={done ? "flex-1 text-black/35 line-through" : "flex-1"}>{t as string}</span>
              <span className="text-black/35">{d as string}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-black/[0.09] px-20 py-32">
        <blockquote className="max-w-[22ch] text-[56px] leading-[1.02] font-semibold tracking-[-0.05em]">
          “The first tracker my team didn’t complain about.”
        </blockquote>
        <p className="mt-8 text-[14px] text-black/45">Maya Ito — Engineering lead, Parcel</p>
      </section>

      <section className="flex items-center justify-between border-t border-black/[0.09] px-20 py-24">
        <h2 className="text-[64px] font-semibold tracking-[-0.06em]">Start with one list.</h2>
        <span className="bg-[#141414] px-8 py-4 text-[16px] text-white">Request access</span>
      </section>

      <footer className="flex justify-between border-t border-black/[0.07] px-20 py-8 text-[13px] text-black/40">
        <span>© Lineal</span>
        <span>Privacy · Terms · Status</span>
      </footer>
    </div>
  );
}

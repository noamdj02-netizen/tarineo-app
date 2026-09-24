const GREEN = "#5ee29a";

const GRID = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
  backgroundSize: "48px 48px",
} as const;

export function DarkTerminalPreview() {
  return (
    <div className="bg-[#0a0b0a] font-sans text-[#e8ebe8]">
      <div style={GRID}>
        <nav className="flex items-center justify-between px-16 py-6 font-mono text-[13.5px]">
          <span className="flex items-center gap-2 text-[15px] text-white">
            <span style={{ color: GREEN }}>▲</span> shipd
          </span>
          <span className="flex gap-9 text-white/45">
            <span>docs</span>
            <span>cli</span>
            <span>pricing</span>
            <span>github ★ 12.4k</span>
          </span>
          <span className="rounded-md border border-white/15 px-4 py-2">Sign in</span>
        </nav>

        <header className="grid grid-cols-[1fr_540px] items-center gap-14 px-16 pt-24 pb-28">
          <div>
            <p className="font-mono text-[13px]" style={{ color: GREEN }}>
              $ v3.2 — zero-config deploys
            </p>
            <h1 className="mt-6 text-[72px] leading-[0.98] font-semibold tracking-[-0.05em] text-white">
              Deploy from your terminal.
              <span className="text-white/35"> Nothing else.</span>
            </h1>
            <p className="mt-6 max-w-[44ch] text-[18px] leading-relaxed text-white/50">
              One command turns any repo into a production URL. Previews per branch, rollbacks in a
              second.
            </p>
            <div className="mt-9 flex items-center gap-4">
              <span className="flex items-center gap-3 rounded-md border border-white/12 bg-white/[0.04] px-5 py-3.5 font-mono text-[15px]">
                <span style={{ color: GREEN }}>$</span> npx shipd deploy
                <span className="ml-3 text-[12px] text-white/35">copy</span>
              </span>
              <span className="rounded-md px-6 py-3.5 text-[15px] font-medium text-black" style={{ background: GREEN }}>
                Read the docs
              </span>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0f110f] shadow-[0_40px_90px_-40px_rgba(0,0,0,0.9)]">
            <div className="flex items-center gap-2 border-b border-white/[0.07] px-4 py-3">
              {[0, 1, 2].map((i) => (
                <i key={i} className="block size-2.5 rounded-full bg-white/15" />
              ))}
              <span className="ml-3 font-mono text-[11.5px] text-white/35">~/acme-web — zsh</span>
            </div>
            <pre className="p-6 font-mono text-[13.5px] leading-[1.9] text-white/70">
              <span style={{ color: GREEN }}>❯</span> shipd deploy --prod{"\n"}
              <span className="text-white/35">  Detecting framework… </span>Next.js{"\n"}
              <span className="text-white/35">  Installing deps…     </span>1.8s{"\n"}
              <span className="text-white/35">  Building…            </span>12.4s{"\n"}
              <span className="text-white/35">  Uploading 214 files… </span>0.9s{"\n"}
              {"\n"}
              <span style={{ color: GREEN }}>  ✓ Live </span>https://acme-web.shipd.app{"\n"}
              <span className="text-white/35">  ✓ Preview for </span>feat/checkout{"\n"}
              {"\n"}
              <span style={{ color: GREEN }}>❯</span> <span className="inline-block h-4 w-2 translate-y-0.5 bg-white/70" />
            </pre>
          </div>
        </header>
      </div>

      <section className="grid grid-cols-4 border-y border-white/[0.07]">
        {[
          ["14s", "median build"],
          ["99.99%", "uptime, 12 months"],
          ["31", "edge regions"],
          ["0", "config files"],
        ].map(([v, k], i) => (
          <div key={k} className={i ? "border-l border-white/[0.07] px-10 py-10" : "px-16 py-10"}>
            <p className="text-[40px] font-semibold tracking-[-0.04em] text-white">{v}</p>
            <p className="mt-1 font-mono text-[12.5px] text-white/40">{k}</p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-2 gap-6 px-16 py-24">
        <div className="rounded-xl border border-white/10 bg-[#0f110f] p-7">
          <p className="font-mono text-[12px] text-white/40">shipd.config.ts — optional</p>
          <pre className="mt-5 font-mono text-[14px] leading-[1.85] text-white/65">
            <span className="text-[#8fb4ff]">export default</span> {"{"}{"\n"}
            {"  "}regions: [<span style={{ color: GREEN }}>&quot;cdg&quot;</span>, <span style={{ color: GREEN }}>&quot;iad&quot;</span>],{"\n"}
            {"  "}previews: <span className="text-[#f2c56b]">true</span>,{"\n"}
            {"  "}env: {"{"} <span style={{ color: GREEN }}>DATABASE_URL</span> {"}"},{"\n"}
            {"}"}
          </pre>
        </div>
        <div className="flex flex-col justify-center gap-7">
          {[
            ["Branch previews", "Every push gets its own URL, shared in the PR."],
            ["Instant rollbacks", "shipd rollback — back to the last good build in one second."],
            ["Logs that stream", "Tail production from the same terminal you deploy from."],
          ].map(([t, d]) => (
            <div key={t} className="border-l-2 pl-5" style={{ borderColor: GREEN }}>
              <h3 className="text-[21px] font-semibold tracking-[-0.03em] text-white">{t}</h3>
              <p className="mt-1.5 text-[15.5px] text-white/50">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-white/[0.07] px-16 py-24 text-center" style={GRID}>
        <h2 className="text-[52px] font-semibold tracking-[-0.05em] text-white">Your next deploy takes 14 seconds.</h2>
        <span className="mt-8 inline-block rounded-md border border-white/12 bg-white/[0.04] px-6 py-4 font-mono text-[16px]">
          <span style={{ color: GREEN }}>$</span> npx shipd deploy
        </span>
      </section>
    </div>
  );
}

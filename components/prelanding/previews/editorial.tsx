const PAPER = "#f4efe6";
const INK = "#1b1a17";

/** Faux visuel éditorial : aplats et formes, sans image lourde. */
function Plate({ tone, className, children }: { tone: string; className?: string; children?: React.ReactNode }) {
  return (
    <div className={`relative overflow-hidden ${className ?? ""}`} style={{ background: tone }}>
      {children}
    </div>
  );
}

export function EditorialPreview() {
  return (
    <div className="font-sans" style={{ background: PAPER, color: INK }}>
      <nav className="flex items-center justify-between border-b border-black/15 px-16 py-5 text-[13px] tracking-[0.14em] uppercase">
        <span>Index</span>
        <span className="font-serif text-[30px] tracking-normal normal-case">Maison Arlo</span>
        <span>Contact</span>
      </nav>

      <header className="grid grid-cols-12 gap-6 px-16 pt-16">
        <div className="col-span-7">
          <p className="text-[12px] tracking-[0.2em] text-black/50 uppercase">Studio de design — Vol. 12</p>
          <h1 className="mt-6 font-serif text-[132px] leading-[0.86] tracking-[-0.03em]">
            Objects
            <br />
            <i className="pl-24">for slow</i>
            <br />
            living.
          </h1>
        </div>
        <div className="col-span-5 flex flex-col gap-6 pt-20">
          <Plate tone="#c9b79c" className="h-[420px]">
            <i className="absolute right-10 bottom-0 block h-[300px] w-[150px] rounded-t-full bg-[#8a6e4f]" />
            <i className="absolute bottom-0 left-12 block size-[150px] rounded-full bg-[#e9dfcf]" />
          </Plate>
          <p className="max-w-[36ch] text-[16px] leading-relaxed text-black/60">
            A furniture and lighting studio in Lyon. Each piece is drawn, built and finished by the
            same four hands.
          </p>
        </div>
      </header>

      <section className="mt-20 grid grid-cols-12 gap-6 border-t border-black/15 px-16 pt-10">
        <p className="col-span-3 text-[12px] tracking-[0.2em] text-black/50 uppercase">Chapter I</p>
        <p className="col-span-8 font-serif text-[46px] leading-[1.08]">
          We make fewer things, on purpose. Oak, linen, brass —{" "}
          <span className="text-black/40">materials that get better as they age.</span>
        </p>
      </section>

      <section className="mt-20 grid grid-cols-12 gap-6 px-16">
        <figure className="col-span-5">
          <Plate tone="#2f3a33" className="h-[520px]">
            <i className="absolute top-16 left-1/2 block h-[180px] w-[2px] -translate-x-1/2 bg-[#d8c7a6]" />
            <i className="absolute top-[228px] left-1/2 block h-[90px] w-[180px] -translate-x-1/2 rounded-t-full bg-[#d8c7a6]" />
          </Plate>
          <figcaption className="mt-3 text-[13px] text-black/50">Lampe Aube, laiton brossé — 2026</figcaption>
        </figure>
        <figure className="col-span-6 col-start-7 mt-40">
          <Plate tone="#d9cbb3" className="h-[380px]">
            <i className="absolute right-16 bottom-16 left-16 block h-[18px] bg-[#6d5438]" />
            <i className="absolute bottom-0 left-24 block h-16 w-[10px] bg-[#6d5438]" />
            <i className="absolute right-24 bottom-0 block h-16 w-[10px] bg-[#6d5438]" />
          </Plate>
          <figcaption className="mt-3 text-[13px] text-black/50">Table Rive, chêne massif</figcaption>
        </figure>
      </section>

      <section className="mt-24 grid grid-cols-3 border-y border-black/15">
        {[
          ["Drawn", "Every piece starts on paper, at scale."],
          ["Built", "Joinery over screws, oil over varnish."],
          ["Kept", "Repairs are free for the lifetime of the piece."],
        ].map(([t, d], i) => (
          <div key={t} className={i ? "border-l border-black/15 p-12" : "p-12 pl-16"}>
            <h3 className="font-serif text-[40px] leading-none">{t}</h3>
            <p className="mt-4 text-[15.5px] leading-relaxed text-black/60">{d}</p>
          </div>
        ))}
      </section>

      <section className="px-16 py-28 text-center">
        <p className="text-[12px] tracking-[0.2em] text-black/50 uppercase">Commissions open — Spring</p>
        <h2 className="mt-6 font-serif text-[88px] leading-[0.95] tracking-[-0.02em]">
          Let’s make <i>yours</i>.
        </h2>
        <span className="mt-10 inline-block border border-black px-9 py-4 text-[13px] tracking-[0.16em] uppercase">
          Book a studio visit
        </span>
      </section>
    </div>
  );
}

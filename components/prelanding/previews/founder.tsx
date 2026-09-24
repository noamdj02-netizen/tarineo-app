import { ArrowRight } from "lucide-react";
import { AppWindow } from "./shared";

const WARM = "#fbf7f1";
const CLAY = "#c4633f";

export function FounderPreview() {
  return (
    <div className="font-sans text-[#1d1b18]" style={{ background: WARM }}>
      <nav className="flex items-center justify-between px-16 py-6 text-[15px]">
        <span className="font-serif text-[26px]">Pagekeep</span>
        <span className="flex gap-8 text-black/50">
          <span>Story</span>
          <span>Product</span>
          <span>Wall of love</span>
        </span>
        <span className="rounded-full border border-black/15 px-5 py-2.5 font-medium">Try it — €9</span>
      </nav>

      <header className="grid grid-cols-[1fr_400px] items-center gap-16 px-16 pt-14 pb-20">
        <div>
          <p className="text-[15px] text-black/50">Hi, I’m Sam 👋</p>
          <h1 className="mt-5 text-[76px] leading-[0.96] font-bold tracking-[-0.055em]">
            I built the reading app{" "}
            <span className="font-serif font-normal italic tracking-[-0.02em]" style={{ color: CLAY }}>
              I wanted
            </span>{" "}
            for ten years.
          </h1>
          <p className="mt-7 max-w-[46ch] text-[18px] leading-relaxed text-black/55">
            No feed, no streaks, no ads. Just your saved articles, typeset like a book. Built alone,
            funded by readers.
          </p>
          <div className="mt-9 flex items-center gap-5">
            <span className="flex items-center gap-2 rounded-full px-7 py-3.5 text-[16px] font-semibold text-white" style={{ background: CLAY }}>
              Get Pagekeep <ArrowRight className="size-4" />
            </span>
            <span className="text-[15px] text-black/50">One-time €9 · 2,318 readers</span>
          </div>
        </div>
        <figure className="relative">
          <div className="relative h-[460px] overflow-hidden rounded-[28px] bg-[#e5d6c3]">
            <i className="absolute top-[90px] left-1/2 block size-[150px] -translate-x-1/2 rounded-full bg-[#b98d6b]" />
            <i className="absolute bottom-[-60px] left-1/2 block h-[260px] w-[300px] -translate-x-1/2 rounded-t-[150px] bg-[#3b4a44]" />
          </div>
          <figcaption className="absolute -bottom-5 -left-8 rotate-[-3deg] rounded-xl bg-white px-4 py-3 text-[14px] shadow-[0_12px_30px_-12px_rgba(0,0,0,0.25)]">
            <b className="block">Sam Lefèvre</b>
            <span className="text-black/45">maker, ex-bookseller</span>
          </figcaption>
        </figure>
      </header>

      <section className="mx-auto max-w-[760px] py-16">
        <p className="text-[13px] tracking-[0.16em] text-black/45 uppercase">Why I made this</p>
        <p className="mt-6 font-serif text-[36px] leading-[1.25]">
          “I used to sell books in Nantes. When I moved to tech, I read more than ever — and enjoyed
          it less. Every app wanted my attention. I wanted my evenings back.”
        </p>
        <p className="mt-6 text-[17px] leading-relaxed text-black/55">
          So I spent two winters building Pagekeep: a quiet place for long reads. It does less, on
          purpose.
        </p>
      </section>

      <section className="px-24 py-10">
        <AppWindow url="pagekeep.app/read">
          <div className="grid grid-cols-[260px_1fr]">
            <aside className="flex flex-col gap-3 border-r border-black/[0.06] p-5 text-[13.5px]">
              {["The case for slow software", "A year without notifications", "On bookshops"].map((t, i) => (
                <div key={t} className={i === 0 ? "rounded-lg bg-[#f5efe6] p-3" : "p-3"}>
                  <p className="font-medium">{t}</p>
                  <p className="text-[12px] text-black/40">{12 + i * 4} min</p>
                </div>
              ))}
            </aside>
            <article className="px-16 py-12">
              <h3 className="font-serif text-[40px] leading-tight">The case for slow software</h3>
              <div className="mt-6 flex flex-col gap-3">
                {[100, 96, 98, 72, 0, 100, 94, 88].map((w, i) => (
                  <i key={i} className="block h-2.5 rounded-full bg-black/[0.07]" style={{ width: `${w}%`, opacity: w ? 1 : 0 }} />
                ))}
              </div>
            </article>
          </div>
        </AppWindow>
      </section>

      <section className="grid grid-cols-3 gap-5 px-16 py-20">
        {[
          ["Finally, an app that respects me.", "Julia, designer"],
          ["I read three books’ worth of articles last month.", "Marc, teacher"],
          ["Paid once, happy forever. Bless Sam.", "Rui, developer"],
        ].map(([q, n]) => (
          <figure key={n} className="rounded-2xl bg-white p-7">
            <blockquote className="text-[18px] leading-relaxed">“{q}”</blockquote>
            <figcaption className="mt-4 text-[14px] text-black/45">— {n}</figcaption>
          </figure>
        ))}
      </section>

      <section className="px-16 pb-24 text-center">
        <h2 className="text-[52px] font-bold tracking-[-0.05em]">
          Read like it’s <span className="font-serif font-normal italic" style={{ color: CLAY }}>Sunday</span>.
        </h2>
        <span className="mt-8 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[16px] font-semibold text-white" style={{ background: CLAY }}>
          Get Pagekeep — €9 <ArrowRight className="size-4" />
        </span>
        <p className="mt-4 text-[14px] text-black/45">30-day refund, no questions — Sam</p>
      </section>
    </div>
  );
}

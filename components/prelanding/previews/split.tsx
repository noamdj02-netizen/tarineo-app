import { ArrowRight, Check, CreditCard } from "lucide-react";
import { Avatar } from "./shared";

const ORANGE = "#ff5b24";

export function SplitPreview() {
  return (
    <div className="bg-white font-sans text-[#101114]">
      <nav className="flex items-center justify-between border-b border-black/[0.07] px-16 py-5 text-[15px]">
        <span className="text-[20px] font-bold tracking-[-0.045em]">
          invoic<span style={{ color: ORANGE }}>.</span>
        </span>
        <span className="flex gap-8 text-black/55">
          <span>How it works</span>
          <span>Pricing</span>
          <span>Customers</span>
        </span>
        <span className="font-medium">Sign in</span>
      </nav>

      <header className="grid min-h-[720px] grid-cols-2">
        <div className="flex flex-col justify-center px-16 py-20">
          <p className="text-[13px] font-semibold tracking-[0.12em] uppercase" style={{ color: ORANGE }}>
            For freelancers & small studios
          </p>
          <h1 className="mt-5 text-[70px] leading-[0.96] font-bold tracking-[-0.055em]">Get paid 2× faster.</h1>
          <p className="mt-6 max-w-[40ch] text-[18px] leading-relaxed text-black/55">
            Send an invoice in 30 seconds. Automatic reminders do the chasing so you don’t have to.
          </p>
          <div className="mt-9 flex max-w-[460px] rounded-xl border border-black/15 p-1.5">
            <span className="flex-1 px-4 py-3 text-[15px] text-black/35">you@studio.com</span>
            <span className="flex items-center gap-2 rounded-lg px-6 py-3 text-[15px] font-semibold text-white" style={{ background: ORANGE }}>
              Start free <ArrowRight className="size-4" />
            </span>
          </div>
          <ul className="mt-6 flex gap-6 text-[14px] text-black/55">
            {["Free forever plan", "No card needed", "Cancel anytime"].map((x) => (
              <li key={x} className="flex items-center gap-1.5">
                <Check className="size-4" style={{ color: ORANGE }} /> {x}
              </li>
            ))}
          </ul>
          <div className="mt-12 flex items-center gap-4">
            <div className="flex -space-x-2.5">
              {[20, 90, 160, 240].map((h) => (
                <Avatar key={h} hue={h} className="size-9 ring-2 ring-white" />
              ))}
            </div>
            <p className="text-[14px] text-black/55">
              <b className="text-black">4,800</b> freelancers paid this month
            </p>
          </div>
        </div>

        <div className="relative flex items-center justify-center overflow-hidden bg-[#f5f3ef]">
          <div className="w-[440px] rounded-2xl bg-white p-8 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.25)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[13px] text-black/45">Invoice #0142</p>
                <p className="mt-1 text-[20px] font-semibold tracking-[-0.03em]">Atelier Brume</p>
              </div>
              <span className="rounded-full bg-[#e8f7ee] px-3 py-1 text-[12.5px] font-semibold text-[#1c8a4b]">Paid</span>
            </div>
            <div className="mt-6 flex flex-col gap-3 border-y border-black/[0.07] py-5 text-[14.5px]">
              {[
                ["Brand identity", "€2,400"],
                ["Website design", "€3,200"],
                ["Revisions (2)", "€400"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-black/60">{k}</span>
                  <span className="font-medium">{v}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-end justify-between">
              <span className="text-[14px] text-black/50">Total</span>
              <span className="text-[40px] font-bold tracking-[-0.05em]">€6,000</span>
            </div>
            <span className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-[#101114] py-3.5 text-[15px] font-medium text-white">
              <CreditCard className="size-4" /> Paid in 2 days
            </span>
          </div>
          <span className="absolute top-24 right-14 rounded-xl bg-white px-4 py-3 text-[13px] shadow-[0_12px_30px_-12px_rgba(0,0,0,0.25)]">
            <b className="block">Reminder sent</b>
            <span className="text-black/45">Day 3 · automatic</span>
          </span>
        </div>
      </header>

      <section className="grid grid-cols-3 gap-10 border-t border-black/[0.07] px-16 py-20">
        {[
          ["1", "Create", "Pick a client, add lines. Taxes and currency are handled."],
          ["2", "Send", "One link, payable by card or bank transfer."],
          ["3", "Get paid", "Reminders go out on day 3, 7 and 14 — politely."],
        ].map(([n, t, d]) => (
          <div key={n}>
            <span className="grid size-10 place-items-center rounded-full text-[15px] font-bold text-white" style={{ background: ORANGE }}>
              {n}
            </span>
            <h3 className="mt-5 text-[24px] font-bold tracking-[-0.04em]">{t}</h3>
            <p className="mt-2 text-[15.5px] leading-relaxed text-black/55">{d}</p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-2 items-center gap-10 bg-[#101114] px-16 py-20 text-white">
        <h2 className="text-[52px] leading-[0.98] font-bold tracking-[-0.055em]">Stop chasing. Start invoicing.</h2>
        <div className="flex justify-end">
          <span className="flex items-center gap-2 rounded-xl px-8 py-4 text-[17px] font-semibold" style={{ background: ORANGE }}>
            Create my first invoice <ArrowRight className="size-5" />
          </span>
        </div>
      </section>
    </div>
  );
}

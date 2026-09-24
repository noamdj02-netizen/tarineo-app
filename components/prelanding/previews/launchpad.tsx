import { ArrowRight, Check, Gauge, Layers, ShieldCheck, Star } from "lucide-react";
import { AppWindow, Avatar, Bars } from "./shared";

const BLUE = "#2f5bff";

export function LaunchpadPreview() {
  return (
    <div className="bg-white font-sans text-[#0b0d12]">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-16 py-6">
        <span className="flex items-center gap-2.5 text-[19px] font-semibold tracking-[-0.03em]">
          <i className="block size-7 rounded-[8px]" style={{ background: BLUE }} />
          Launchpad
        </span>
        <span className="flex gap-9 text-[15px] text-black/55">
          <span>Product</span>
          <span>Customers</span>
          <span>Pricing</span>
          <span>Docs</span>
        </span>
        <span className="flex items-center gap-5 text-[15px]">
          <span className="text-black/60">Sign in</span>
          <span className="rounded-full px-5 py-2.5 font-medium text-white" style={{ background: BLUE }}>
            Start free
          </span>
        </span>
      </nav>

      {/* Hero */}
      <header className="flex flex-col items-center px-16 pt-14 text-center">
        <span className="flex items-center gap-2 rounded-full border border-black/[0.08] py-1.5 pr-4 pl-1.5 text-[13.5px] text-black/60">
          <b className="rounded-full px-2.5 py-0.5 text-[12px] font-medium text-white" style={{ background: BLUE }}>
            New
          </b>
          Launchpad 2.0 is live
          <ArrowRight className="size-3.5" />
        </span>
        <h1 className="mt-7 max-w-[15ch] text-[76px] leading-[0.98] font-semibold tracking-[-0.05em]">
          Ship your product in days, not months.
        </h1>
        <p className="mt-6 max-w-[52ch] text-[19px] leading-relaxed text-black/55">
          Auth, billing, onboarding and analytics, wired together. Focus on the part only you can
          build.
        </p>
        <div className="mt-9 flex gap-3">
          <span className="flex items-center gap-2 rounded-full px-7 py-3.5 text-[16px] font-medium text-white" style={{ background: BLUE }}>
            Start building free <ArrowRight className="size-4" />
          </span>
          <span className="rounded-full border border-black/10 px-7 py-3.5 text-[16px] font-medium">
            Book a demo
          </span>
        </div>
        <p className="mt-4 text-[13.5px] text-black/40">No credit card · Free up to 1,000 users</p>
      </header>

      {/* Product */}
      <div className="relative mx-auto mt-14 w-[1060px]">
        <div
          className="absolute inset-x-16 -top-8 h-40 rounded-full opacity-[0.16] blur-3xl"
          style={{ background: BLUE }}
        />
        <AppWindow className="relative shadow-[0_30px_80px_-30px_rgba(20,40,120,0.35)]" url="app.launchpad.dev">
          <div className="grid grid-cols-[200px_1fr]">
            <aside className="flex flex-col gap-1 border-r border-black/[0.06] p-4 text-[13px]">
              {["Overview", "Customers", "Revenue", "Onboarding", "Settings"].map((l, i) => (
                <span
                  key={l}
                  className={i === 0 ? "rounded-md bg-black/[0.05] px-2.5 py-1.5 font-medium" : "px-2.5 py-1.5 text-black/50"}
                >
                  {l}
                </span>
              ))}
            </aside>
            <div className="p-6">
              <div className="grid grid-cols-3 gap-4">
                {[
                  ["Active users", "8,214", "+12.4%"],
                  ["MRR", "$24.6k", "+8.1%"],
                  ["Activation", "63%", "+3.2%"],
                ].map(([k, v, d]) => (
                  <div key={k} className="rounded-xl border border-black/[0.07] p-4">
                    <p className="text-[12.5px] text-black/45">{k}</p>
                    <p className="mt-1 text-[26px] font-semibold tracking-[-0.03em]">{v}</p>
                    <p className="text-[12px] font-medium" style={{ color: BLUE }}>{d}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl border border-black/[0.07] p-4">
                <p className="text-[13px] font-medium">Weekly signups</p>
                <Bars
                  className="mt-3 h-[150px]"
                  values={[30, 42, 38, 55, 48, 62, 58, 70, 66, 78, 74, 92]}
                  barClass="bg-[#2f5bff]/15"
                  activeIndex={11}
                  activeClass="bg-[#2f5bff]"
                />
              </div>
            </div>
          </div>
        </AppWindow>
      </div>

      {/* Social proof */}
      <section className="mt-20 px-16 text-center">
        <p className="text-[13px] tracking-[0.12em] text-black/40 uppercase">Trusted by teams at</p>
        <div className="mt-6 flex justify-center gap-16 text-[22px] font-semibold tracking-[-0.03em] text-black/30">
          {["Northwind", "Acme", "Globex", "Umbrella", "Initech"].map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mt-24 grid grid-cols-3 gap-6 px-16">
        {[
          [Gauge, "Fast by default", "Edge rendering and caching, tuned out of the box."],
          [ShieldCheck, "Secure auth", "Magic links, SSO and roles in one import."],
          [Layers, "Billing built in", "Plans, trials and invoices without the glue code."],
        ].map(([Icon, t, d]) => {
          const I = Icon as typeof Gauge;
          return (
            <div key={t as string} className="rounded-2xl border border-black/[0.07] p-7">
              <span className="grid size-11 place-items-center rounded-xl bg-[#2f5bff]/10" style={{ color: BLUE }}>
                <I className="size-5" />
              </span>
              <h3 className="mt-5 text-[21px] font-semibold tracking-[-0.03em]">{t as string}</h3>
              <p className="mt-2 text-[15.5px] leading-relaxed text-black/55">{d as string}</p>
            </div>
          );
        })}
      </section>

      {/* Testimonials */}
      <section className="mt-24 bg-[#f6f7f9] px-16 py-20">
        <h2 className="text-center text-[44px] font-semibold tracking-[-0.045em]">Loved by builders</h2>
        <div className="mt-10 grid grid-cols-3 gap-5">
          {[
            ["We launched our beta in eleven days. The billing module alone saved us a month.", "Clara M.", "Founder, Tidy", 200],
            ["Finally a stack where the defaults are the right ones.", "Tom R.", "CTO, Ferry", 20],
            ["Onboarding went from a week of work to an afternoon.", "Inès B.", "PM, Relay", 320],
          ].map(([q, n, r, h]) => (
            <figure key={n as string} className="rounded-2xl bg-white p-7 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
              <div className="flex gap-0.5" style={{ color: BLUE }}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="size-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-4 text-[17px] leading-relaxed">{q as string}</blockquote>
              <figcaption className="mt-5 flex items-center gap-3 text-[14px]">
                <Avatar hue={h as number} className="size-9" />
                <span>
                  <b className="block font-semibold">{n as string}</b>
                  <span className="text-black/45">{r as string}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="px-16 py-24">
        <h2 className="text-center text-[44px] font-semibold tracking-[-0.045em]">Simple pricing</h2>
        <div className="mt-10 grid grid-cols-3 items-stretch gap-5">
          {[
            ["Starter", "$0", ["1,000 users", "Auth & billing", "Community support"]],
            ["Pro", "$29", ["25,000 users", "Analytics", "Priority support"]],
            ["Scale", "$99", ["Unlimited users", "SSO & audit logs", "Dedicated manager"]],
          ].map(([n, p, f], i) => (
            <div
              key={n as string}
              className={i === 1 ? "rounded-2xl p-8 text-white" : "rounded-2xl border border-black/[0.08] p-8"}
              style={i === 1 ? { background: "#0b0d12" } : undefined}
            >
              <p className="text-[15px] font-medium opacity-70">{n as string}</p>
              <p className="mt-2 text-[48px] font-semibold tracking-[-0.05em]">
                {p as string}
                <small className="text-[15px] font-normal opacity-50">/mo</small>
              </p>
              <ul className="mt-5 flex flex-col gap-2.5 text-[15px]">
                {(f as string[]).map((x) => (
                  <li key={x} className="flex items-center gap-2">
                    <Check className="size-4" style={{ color: i === 1 ? "#8aa4ff" : BLUE }} /> {x}
                  </li>
                ))}
              </ul>
              <span
                className="mt-7 block rounded-full py-3 text-center text-[15px] font-medium"
                style={i === 1 ? { background: BLUE } : { border: "1px solid rgba(0,0,0,.1)" }}
              >
                {i === 1 ? "Start 14-day trial" : "Get started"}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-[760px] pb-20">
        <h2 className="text-center text-[36px] font-semibold tracking-[-0.045em]">Questions</h2>
        {["Can I self-host?", "What happens when I pass 1,000 users?", "Do you offer refunds?", "Is my data encrypted?"].map((q) => (
          <div key={q} className="flex justify-between border-b border-black/[0.07] py-5 text-[17px]">
            {q}
            <span className="text-black/35">+</span>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="mx-16 mb-16 rounded-[28px] px-16 py-16 text-center text-white" style={{ background: "#0b0d12" }}>
        <h2 className="text-[48px] font-semibold tracking-[-0.05em]">Your launch starts today.</h2>
        <span className="mt-7 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[16px] font-medium" style={{ background: BLUE }}>
          Start building free <ArrowRight className="size-4" />
        </span>
      </section>
    </div>
  );
}

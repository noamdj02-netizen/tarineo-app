import { Reveal } from "@/components/motion/reveal";
import { InView } from "@/components/site/in-view";
import { AUDIENCE } from "@/lib/site/tarineo";

/** Métiers — liste éditoriale avec numérotation discrète. */
export function LandingAudience() {
  return (
    <InView className="w-full max-w-[720px] lg:max-w-none" stagger={0.04}>
      <ul className="flex flex-col">
        {AUDIENCE.map((a, i) => (
          <Reveal key={a.id}>
            <li className="grid gap-3 border-t border-[rgba(10,10,10,0.08)] py-5 sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-6 sm:py-6">
              <span
                aria-hidden
                className="font-display text-[15px] font-semibold tabular-nums tracking-[-0.02em] text-[#C4C0B8]"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="text-[16px] font-semibold tracking-[-0.02em] text-[#0A0A0A]">
                  {a.title}
                </p>
                <p className="mt-1.5 text-[15px] leading-[1.55] text-[#6E6E6E]">{a.text}</p>
              </div>
            </li>
          </Reveal>
        ))}
      </ul>
    </InView>
  );
}

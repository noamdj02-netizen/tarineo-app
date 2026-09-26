import Image from "next/image";
import { TestimonialStackLogos } from "@/components/site/landing-testimonials";
import { LANDING_TESTIMONIALS } from "@/lib/site/content";

const PROOF = LANDING_TESTIMONIALS.filter((t) =>
  t.id === "marcus" || t.id === "lea" || t.id === "ines",
);

export function ProofScreen() {
  return (
    <>
      <h2 className="font-serif text-[1.45rem] leading-[1.1] tracking-[-0.02em] sm:text-[1.7rem]">
        Fondateurs seuls, pas une équipe.
      </h2>
      <p className="mt-2 text-[14.5px] leading-relaxed text-muted-foreground">
        Un Focus, une landing, une prochaine action.
      </p>
      <ul className="mt-5 flex flex-col gap-3">
        {PROOF.map((t) => (
          <li key={t.id}>
            <figure className="overflow-hidden rounded-[24px] border border-line bg-surface shadow-soft ring-1 ring-line">
              <div className="px-4 pt-4 pb-1 sm:px-5 sm:pt-5">
                <p className="mono-label">{`/ ${t.brand} ///`}</p>
                <blockquote className="mt-2.5 font-serif text-[0.98rem] leading-[1.4] text-balance sm:text-[1.05rem]">
                  <span className="text-accent-2 not-italic" aria-hidden>
                    «
                  </span>
                  <span className="italic"> {t.quote} </span>
                  <span className="text-accent-2 not-italic" aria-hidden>
                    »
                  </span>
                </blockquote>
              </div>
              <figcaption className="mt-4 flex items-center justify-between gap-3 border-t border-line px-4 pt-3.5 pb-4 sm:px-5 sm:pt-4 sm:pb-5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    className="relative size-11 shrink-0 overflow-hidden rounded-full ring-1 ring-line"
                    style={t.photoBg ? { backgroundColor: t.photoBg } : undefined}
                  >
                    <Image
                      src={t.photo}
                      alt=""
                      fill
                      sizes="44px"
                      className="object-cover"
                      style={{ objectPosition: t.photoPosition ?? "center" }}
                    />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold tracking-tight">{t.name}</p>
                    <p className="mt-0.5 truncate text-[12.5px] leading-snug text-muted-foreground">
                      {t.role}
                    </p>
                  </div>
                </div>
                <TestimonialStackLogos tools={t.stackTools} />
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </>
  );
}

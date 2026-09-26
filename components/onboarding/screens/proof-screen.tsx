import Image from "next/image";
import { TestimonialStackLogos } from "@/components/site/landing-testimonials";
import { LANDING_TESTIMONIALS } from "@/lib/site/content";

const PROOF = LANDING_TESTIMONIALS.filter(
  (t) => t.id === "marcus" || t.id === "lea" || t.id === "ines",
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
      <ul className="mt-4 flex flex-col gap-2.5 pb-1">
        {PROOF.map((t) => (
          <li key={t.id}>
            <figure className="rounded-[20px] border border-line bg-surface px-3.5 py-3 shadow-soft ring-1 ring-line sm:px-4 sm:py-3.5">
              <p className="mono-label">{`/ ${t.brand} ///`}</p>
              <blockquote className="mt-1.5 font-serif text-[0.95rem] leading-[1.35] text-balance sm:text-[1.02rem]">
                <span className="text-accent-2 not-italic" aria-hidden>
                  «
                </span>
                <span className="italic"> {t.quote} </span>
                <span className="text-accent-2 not-italic" aria-hidden>
                  »
                </span>
              </blockquote>
              <figcaption className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-2.5">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="relative size-9 shrink-0 overflow-hidden rounded-full ring-1 ring-line"
                    style={t.photoBg ? { backgroundColor: t.photoBg } : undefined}
                  >
                    <Image
                      src={t.photo}
                      alt=""
                      fill
                      sizes="36px"
                      className="object-cover"
                      style={{ objectPosition: t.photoPosition ?? "center" }}
                    />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold tracking-tight">{t.name}</p>
                    <p className="truncate text-[12px] leading-snug text-muted-foreground">
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

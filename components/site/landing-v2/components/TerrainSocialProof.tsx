import Image from "next/image";

import type { TerrainReview } from "@/components/site/landing-v2/components/TerrainReviewCard";

type Stat = { value: string; label: string };

export function TerrainSocialProof({
  eyebrow,
  stats,
  trustLine,
  reviews,
}: {
  eyebrow: string;
  stats: Stat[];
  trustLine: string;
  reviews: Pick<TerrainReview, "photo" | "name" | "photoPosition">[];
}) {
  const faces = reviews.slice(0, 4);

  return (
    <div
      className="w-full max-w-[1120px] rounded-[20px] border border-[#e4e7ec] bg-white px-4 py-5 shadow-[0_1px_2px_rgba(16,24,40,0.05)] sm:px-8 sm:py-6"
      aria-label="Indicateurs de lancement"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
          <div className="flex shrink-0 -space-x-2.5" aria-hidden>
            {faces.map((r) => (
              <span
                key={r.name}
                className="relative inline-block size-10 overflow-hidden rounded-full ring-2 ring-white"
              >
                <Image
                  src={r.photo}
                  alt=""
                  fill
                  sizes="40px"
                  className="object-cover"
                  style={r.photoPosition ? { objectPosition: r.photoPosition } : undefined}
                />
              </span>
            ))}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#ec5821]">{eyebrow}</p>
            <p className="mt-1 text-pretty text-sm leading-relaxed text-[#475467]">{trustLine}</p>
          </div>
        </div>

        <ul className="grid min-w-0 grid-cols-3 gap-2 border-t border-[#f2f4f7] pt-5 sm:gap-6 sm:border-t-0 sm:pt-0 lg:shrink-0">
          {stats.map((stat) => (
            <li key={stat.label} className="min-w-0 text-center sm:text-left">
              <p className="text-xl font-semibold tracking-tight text-[#202939] sm:text-[28px]">{stat.value}</p>
              <p className="mt-0.5 text-[10px] leading-snug text-[#697586] sm:text-sm">{stat.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

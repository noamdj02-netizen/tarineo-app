import Image from "next/image";

import { heroChantiersCard } from "@/lib/site/landing-v2-content";
import { cn } from "@/lib/utils";

const ASSETS = {
  frame1: "/landing/figma/hero/assets/frame-862.svg",
  frame2: "/landing/figma/hero/assets/frame-862-2.svg",
  frame3: "/landing/figma/hero/assets/frame-862-3.svg",
} as const;

function StatusPill({ label }: { label: string }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full bg-[#dcffdb] px-1.5 py-px",
        "text-[13px] font-medium leading-5 text-[#009500]",
        "outline outline-1 outline-offset-[-1px] outline-[#cdffcc]",
      )}
    >
      {label}
    </span>
  );
}

function ChantierRow({
  title,
  meta,
  status,
  avatar,
  actionsSrc,
}: {
  title: string;
  meta: string;
  status: string;
  avatar: string;
  actionsSrc: string;
}) {
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center gap-[9px]">
        <div className="relative size-[45px] shrink-0 overflow-hidden rounded-full bg-[#ff6000]">
          <Image src={avatar} alt="" fill sizes="45px" className="object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-x-2 gap-y-1">
            <div className="min-w-0 flex-1 basis-[min(100%,12rem)]">
              <p className="text-pretty text-[15px] font-semibold leading-snug text-[#3d3d3d]">{title}</p>
              <p className="text-pretty text-[14px] font-medium leading-snug text-[#666666]">{meta}</p>
            </div>
            <StatusPill label={status} />
          </div>
        </div>
      </div>
      <Image
        src={actionsSrc}
        alt=""
        width={221}
        height={30}
        className="h-[30px] w-full max-w-[221px] object-contain object-left"
      />
    </div>
  );
}

/** Figma `235:33614` — carte hero « Un dossier par chantier ». */
export function HeroChantiersCard({ className }: { className?: string }) {
  const { title, rows, srLabel } = heroChantiersCard;
  const actionFrames = [ASSETS.frame1, ASSETS.frame2, ASSETS.frame3];

  return (
    <article
      data-node-id="235:33614"
      className={cn(
        "flex min-h-[331px] w-[281px] max-w-full flex-col items-center overflow-hidden rounded-[20px] bg-[#fcfcfc]",
        "shadow-[0_0_0_4px_#ffffff] outline outline-1 outline-offset-[-1px] outline-[#f2f2f2]",
        className,
      )}
    >
      <div className="flex w-full shrink-0 items-center justify-center gap-2.5 px-2.5 pb-4 pt-5">
        <p className="shrink-0 whitespace-nowrap text-center text-base font-semibold leading-6 text-[#1a1a1a]">
          {title}
        </p>
      </div>

      <div className="flex w-full min-h-0 flex-1 flex-col items-stretch gap-3 overflow-hidden px-4 pb-3 sm:px-[30px]">
        {rows.map((row, index) => (
          <ChantierRow
            key={row.id}
            title={row.title}
            meta={row.meta}
            status={row.status}
            avatar={row.avatar}
            actionsSrc={actionFrames[index] ?? ASSETS.frame1}
          />
        ))}
      </div>

      <p className="sr-only">{srLabel}</p>
    </article>
  );
}

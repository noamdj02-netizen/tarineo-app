import { TarineoHdMascot, type TarineoHdMascotName } from "@/components/tarineo-hd-mascot";

/**
 * En-tête d'onglet : label « / LABEL /// », titre en deux tons, chapeau, mascotte HD.
 */
export function PageHead({
  label,
  title,
  tail,
  mascot,
  children,
}: {
  label: string;
  title: string;
  tail?: string;
  mascot?: TarineoHdMascotName;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-6">
      <div className="flex min-w-0 flex-col gap-3">
        <p className="mono-label">{`/ ${label} ///`}</p>
        <h1 className="font-display text-[clamp(30px,6vw,44px)] leading-[1.02] font-semibold tracking-tightest text-balance">
          {title}
          {tail ? <span className="text-accent-2"> {tail}</span> : null}
        </h1>
        {children ? (
          <p className="max-w-[62ch] text-[15.5px] leading-relaxed text-muted-foreground">{children}</p>
        ) : null}
      </div>
      {mascot ? (
        <TarineoHdMascot name={mascot} className="-my-3 hidden h-24 w-28 sm:block sm:h-28 sm:w-32 lg:h-32 lg:w-36" label="" />
      ) : null}
    </div>
  );
}

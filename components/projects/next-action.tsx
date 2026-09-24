import { ArrowRightCircle } from "lucide-react";

/** Encadré « Prochaine action ». */
export function NextAction({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div className="flex items-start gap-2.5 rounded-xl bg-accent-soft px-3.5 py-3 text-[14px] leading-snug">
      <ArrowRightCircle className="mt-px size-4 flex-none text-ink" aria-hidden />
      <span>
        <b className="font-semibold">Prochaine action :</b> {text}
      </span>
    </div>
  );
}

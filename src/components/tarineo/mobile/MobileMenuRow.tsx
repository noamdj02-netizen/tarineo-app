import Link from "next/link";

export function MobileMenuRow({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl border border-[#dcdfe1] bg-white px-4 py-3.5 shadow-[0_4px_12px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] transition-transform active:scale-[0.99]"
    >
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold text-[#172935]">{title}</p>
        <p className="text-xs text-[#53616a]">{description}</p>
      </div>
      <span className="text-xl font-medium text-[#53616a]" aria-hidden>›</span>
    </Link>
  );
}

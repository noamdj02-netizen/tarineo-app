import Link from "next/link";

export function MobileSectionHeader({
  title,
  href,
  linkLabel = "Voir tout",
}: {
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-[17px] font-bold tracking-[-0.2px] text-[#0f1c28]">{title}</h2>
      {href && (
        <Link href={href} className="text-[13px] font-semibold text-primary">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}

import Link from "next/link";
import { cn } from "@/lib/utils";
import { IconCalendar, IconChevron } from "./NavIcons";

type BtnProps = {
  children: React.ReactNode;
  className?: string;
  href?: string;
  type?: "button" | "submit";
  onClick?: () => void;
};

function base(className?: string) {
  return cn("inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium transition-colors", className);
}

export function BtnPrimary({ href, children, className, type = "button", onClick }: BtnProps) {
  const cls = base(cn("bg-primary text-white hover:opacity-95", className));
  if (href) return <Link href={href} className={cls}>{children}</Link>;
  return (
    <button type={type} onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

export function BtnGhost({ href, children, className, type = "button", onClick }: BtnProps) {
  const cls = base(cn("border border-[#E6E9EB] bg-white text-[#172935] hover:bg-[#F8F8F8]", className));
  if (href) return <Link href={href} className={cls}>{children}</Link>;
  return (
    <button type={type} onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

export function BtnBlue({ href, children, className, type = "button", onClick }: BtnProps) {
  const cls = base(cn("border border-[#3B6AE1] bg-white text-[#3B6AE1] hover:bg-[#F4F7FF]", className));
  if (href) return <Link href={href} className={cls}>{children}</Link>;
  return (
    <button type={type} onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

export function BtnOrangeOutline({ href, children, className, type = "button", onClick }: BtnProps) {
  const cls = base(cn("border border-primary bg-white text-primary hover:bg-[#FFF0E8]", className));
  if (href) return <Link href={href} className={cls}>{children}</Link>;
  return (
    <button type={type} onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

export function PeriodSelect({ label = "6 mois", className }: { label?: string; className?: string }) {
  return (
    <button type="button" className={cn("inline-flex h-11 items-center gap-2 rounded-full bg-white px-4 text-sm text-[#172935]", className)}>
      <IconCalendar />
      {label}
      <IconChevron className="text-muted-foreground" />
    </button>
  );
}

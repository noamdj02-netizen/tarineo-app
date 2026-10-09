import { cn } from "@/lib/utils";

export function LandingChromeDots({ size = "md" }: { size?: "sm" | "md" }) {
  const dot = size === "sm" ? "size-[5px]" : "size-2.5";
  return (
    <span className={cn("flex shrink-0 gap-1.5", size === "sm" && "gap-1")} aria-hidden>
      <span className={cn(dot, "rounded-full bg-[#FF5F57]")} />
      <span className={cn(dot, "rounded-full bg-[#FEBC2E]")} />
      <span className={cn(dot, "rounded-full bg-[#28C840]")} />
    </span>
  );
}

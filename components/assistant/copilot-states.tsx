"use client";

import { useReducedMotion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThinkingDots({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-[5px]", className)} aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-[5px] rounded-full bg-current motion-reduce:opacity-70"
          style={{
            animation: "copilot-dot 900ms ease-in-out infinite",
            animationDelay: `${i * 150}ms`,
          }}
        />
      ))}
    </span>
  );
}

export function CopilotLiveDot({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-block size-1.5 rounded-full bg-[#FF6B1A]", className)}
      style={{ animation: "copilot-live 1.2s ease-in-out infinite" }}
      aria-hidden
    />
  );
}

export function StreamingCaret() {
  const reduce = useReducedMotion();
  return (
    <span
      className="ml-0.5 inline-block translate-y-px text-[11px] text-[#FF6B1A]"
      style={reduce ? undefined : { animation: "copilot-caret 900ms ease-in-out infinite" }}
      aria-hidden
    >
      ▌
    </span>
  );
}

export function ThinkingState({
  title,
  detail,
}: {
  title: string;
  detail?: string | null;
}) {
  const contextual = Boolean(detail);
  return (
    <div
      role="status"
      className={contextual ? "border-l-2 border-[#FF6B1A] pl-3" : undefined}
    >
      <div className="flex items-start gap-2.5">
        <CopilotLiveDot className="mt-1.5 shrink-0" />
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-ink">{title}</p>
          {detail ? <p className="mt-0.5 text-[12px] text-[#6E6E6E] dark:text-[#A1A1A1]">{detail}</p> : null}
          <p className="mt-1.5 flex items-center gap-2 text-[12px] text-[#6E6E6E] dark:text-[#A1A1A1]">
            {contextual ? "Analyse en cours" : null}
            <ThinkingDots />
          </p>
        </div>
      </div>
    </div>
  );
}

export function ToolLine({
  label,
  tone = "running",
}: {
  label: string;
  tone?: "running" | "success" | "error";
}) {
  return (
    <p
      role="status"
      className={cn(
        "flex items-center gap-2 text-[12.5px]",
        tone === "error" ? "text-destructive" : "text-[#6E6E6E] dark:text-[#A1A1A1]",
      )}
    >
      {tone === "running" ? (
        <Loader2 className="size-3.5 animate-spin motion-reduce:animate-none" aria-hidden />
      ) : tone === "success" ? (
        <span className="text-[13px]" aria-hidden>
          ✓
        </span>
      ) : null}
      <span>{label}</span>
    </p>
  );
}

export function thinkingFromPath(pathname: string): { title: string; detail?: string } {
  const chantier = pathname.match(/^\/chantiers\/([^/?#]+)/);
  if (chantier?.[1]) {
    return {
      title: "Analyse du chantier",
      detail: titleFromSlug(chantier[1]),
    };
  }
  if (pathname.startsWith("/relances")) return { title: "Analyse des relances" };
  if (pathname.includes("/devis") || pathname.startsWith("/client") || pathname.startsWith("/distributeur")) {
    return { title: "Analyse des devis" };
  }
  if (pathname.startsWith("/achats") || pathname.startsWith("/hausses")) {
    return { title: "Analyse des achats" };
  }
  return { title: "Analyse en cours" };
}

function titleFromSlug(slug: string) {
  try {
    return decodeURIComponent(slug)
      .split("-")
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  } catch {
    return slug;
  }
}

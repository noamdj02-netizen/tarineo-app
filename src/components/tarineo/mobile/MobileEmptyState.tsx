import type { ReactNode } from "react";
import Link from "next/link";
import { MascotteDashboard } from "@/components/tarineo/MascotteDashboard";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

type Cta =
  | { type: "link"; href: string; label: string }
  | { type: "node"; node: ReactNode };

/**
 * État vide mobile soigné — mascotte + titre + CTA clair.
 * À utiliser sur les listes sèches (devis clients, etc.).
 */
export function MobileEmptyState({
  title,
  description,
  primary,
  secondary,
  mascotte = true,
}: {
  title: string;
  description: string;
  primary: Cta;
  secondary?: Cta;
  mascotte?: boolean;
}) {
  return (
    <Empty className="rounded-[24px] border-0 bg-card py-10 shadow-[0_4px_14px_rgba(15,28,40,0.04)] ring-1 ring-foreground/8">
      <EmptyHeader>
        {mascotte ? (
          <EmptyMedia>
            <MascotteDashboard variant="loupe" width={88} height={92} />
          </EmptyMedia>
        ) : null}
        <EmptyTitle className="text-[17px] font-semibold tracking-tight text-foreground">
          {title}
        </EmptyTitle>
        <EmptyDescription className="text-[13px] leading-relaxed">{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="mt-1 gap-2">
        <CtaButton cta={primary} primary />
        {secondary ? <CtaButton cta={secondary} /> : null}
      </EmptyContent>
    </Empty>
  );
}

function CtaButton({ cta, primary }: { cta: Cta; primary?: boolean }) {
  if (cta.type === "node") return <>{cta.node}</>;
  return (
    <Button
      variant={primary ? "default" : "outline"}
      className="h-11 w-full max-w-[280px] rounded-full font-semibold"
      render={<Link href={cta.href} />}
      nativeButton={false}
    >
      {cta.label}
    </Button>
  );
}

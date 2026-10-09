"use client";

import { ArrowRightLeft, Mail, type LucideIcon } from "lucide-react";

import { renegotiationMail, transformBlock } from "@/lib/site/landing-v2-content";
import { LandingSection } from "@/components/site/landing-v2/components/layout/LandingSection";
import { DocumentTransformScene } from "@/components/site/landing-v2/components/ui/scenes/DocumentTransformScene";
import { Badge } from "@/components/site/landing-v2/components/ui/Badge";
import { LandingAppChrome } from "@/components/site/landing-v2/components/ui/LandingAppChrome";
import { LandingFeatureGlyph } from "@/components/site/landing-v2/components/ui/LandingFeatureGlyph";
import { LandingMailPreview } from "@/components/site/landing-v2/components/ui/LandingMailPreview";
import { landingCardClass } from "@/components/site/landing-v2/components/ui/landing-card";
import { SectionHeading } from "@/components/site/landing-v2/components/ui/SectionLabel";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function SectionIntro({
  icon,
  title,
  detail,
  meta,
  titleId,
}: {
  icon: LucideIcon;
  title: string;
  detail?: string;
  meta?: string;
  titleId?: string;
}) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <LandingFeatureGlyph icon={icon} tone="orange" />
      <div className="min-w-0">
        <h3 id={titleId} className="text-heading font-semibold tracking-tight text-ink-900">
          {title}
        </h3>
        {meta ? (
          <p className="text-xs uppercase tracking-widest text-ink-400">{meta}</p>
        ) : null}
        {detail ? <p className="mt-2 text-sm leading-relaxed text-ink-600">{detail}</p> : null}
      </div>
    </div>
  );
}

const DEMO_MARGIN_PCT = 25;

export function NegotiationTransform() {
  return (
    <LandingSection id="transformation">
      <div className="shell">
        <SectionHeading
          label="Renégociation & transformation"
          title="Validez, renégociez, facturez votre client."
        />

        <div className="mt-14 grid gap-8 lg:grid-cols-2 lg:gap-8">
          <div className="flex min-w-0 flex-col" aria-labelledby="transformation-mail-title">
            <SectionIntro
              icon={Mail}
              title={renegotiationMail.title}
              meta={renegotiationMail.exampleNote}
              titleId="transformation-mail-title"
            />
            <LandingMailPreview />
          </div>

          <Card className={cn(landingCardClass(), "flex h-full min-w-0 flex-col")} aria-labelledby="transformation-doc-title">
            <CardContent className="flex flex-col gap-4 pt-5">
              <SectionIntro
                icon={ArrowRightLeft}
                title={transformBlock.title}
                detail={transformBlock.body}
                titleId="transformation-doc-title"
              />
              <div className="flex flex-wrap items-center gap-2">
                {transformBlock.supplierPills.map((p) => (
                  <Badge key={p} tone="outline">{p}</Badge>
                ))}
                <span className="text-ink-300" aria-hidden>→</span>
                {transformBlock.clientPills.map((p) => (
                  <Badge key={p} tone="accent">{p}</Badge>
                ))}
              </div>
              <p className="text-xs text-ink-400">{transformBlock.combinationsNote}</p>
              <LandingAppChrome title="Transformation" bodyClassName="p-2">
                <DocumentTransformScene marginPct={DEMO_MARGIN_PCT} pulseKey={0} extracted compact />
              </LandingAppChrome>
            </CardContent>
          </Card>
        </div>
      </div>
    </LandingSection>
  );
}

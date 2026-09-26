import type { ReactNode } from "react";
import {
  Body,
  Column,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import { Tailwind, type TailwindConfig } from "@react-email/tailwind";
import { BRAND } from "@/lib/brand";
import { NavpitFonts } from "./navpit-fonts";
import { navpitEmailTailwindConfig } from "./theme";

export type NavpitEmailShellProps = {
  preview: string;
  label: string;
  title: string;
  appUrl: string;
  children: ReactNode;
  steps?: { title: string; text: string; href: string; linkLabel: string }[];
  footerNote?: string;
};

function logoUrl(appUrl: string) {
  const base = appUrl.replace(/\/$/, "");
  return `${base}${BRAND.logoSrc}`;
}

export function NavpitEmailShell({
  preview,
  label,
  title,
  appUrl,
  children,
  steps,
  footerNote,
}: NavpitEmailShellProps) {
  const mascot = logoUrl(appUrl);
  const helpUrl = `${appUrl.replace(/\/$/, "")}/#faq`;

  return (
    <Tailwind config={navpitEmailTailwindConfig as unknown as TailwindConfig}>
      <Html lang="fr">
        <Head>
          <NavpitFonts />
        </Head>
        <Body className="m-0 bg-bg-2 p-0 font-sans text-14">
          <Preview>{preview}</Preview>
          <Container className="mx-auto max-w-[640px] bg-bg">
            <Section className="px-6 py-6">
              <Row>
                <Column className="w-[40px] pr-3 align-middle">
                  <Img src={mascot} alt="" width={36} height={36} className="block rounded-lg" />
                </Column>
                <Column className="align-middle">
                  <Text className="m-0 font-display text-[22px] font-bold leading-none tracking-[-0.04em] text-ink">
                    {BRAND.name}
                    <span className="text-muted">.</span>
                  </Text>
                </Column>
              </Row>
            </Section>

            <Section className="px-6 pt-8 pb-10">
              <Text className="m-0 font-mono text-11 uppercase tracking-[0.14em] text-muted">
                {`/ ${label} ///`}
              </Text>
              <Text className="m-0 mt-4 max-w-copy font-display text-40 font-semibold uppercase leading-[1.02] tracking-[-0.04em] text-ink">
                {title}
              </Text>
              <Section className="mt-8 max-w-copy">{children}</Section>
            </Section>

            <Section className="px-6 pb-10">
              <Img
                src={mascot}
                alt=""
                width={592}
                height={592}
                className="block w-full max-w-[592px] rounded-[20px] border border-line bg-surface"
              />
            </Section>

            {steps && steps.length > 0 ? (
              <Section className="px-6 pb-12">
                <Text className="m-0 font-display text-24 font-semibold uppercase tracking-[-0.03em] text-ink">
                  Prochaines étapes
                </Text>
                {steps.map((step) => (
                  <Section key={step.title} className="border-line border-b py-8">
                    <Text className="m-0 mb-2 font-display text-20 font-semibold text-ink">{step.title}</Text>
                    <Text className="m-0 my-2 font-sans text-14 text-ink-2">{step.text}</Text>
                    <Link href={step.href} className="font-sans text-15 text-ink underline">
                      {step.linkLabel}
                    </Link>
                  </Section>
                ))}
              </Section>
            ) : null}

            <Section className="border-line border-t px-6 py-12">
              <Text className="m-0 max-w-[320px] font-sans text-13 text-ink-2">
                {footerNote ??
                  `${BRAND.name} : un seul projet en Focus, la prochaine action visible, et un copilote IA qui connaît tes projets.`}
              </Text>
              <Text className="m-0 mt-6 font-sans text-13 text-ink-2">
                Besoin d&apos;aide ?{" "}
                <Link href={helpUrl} className="text-ink-2 underline">
                  FAQ
                </Link>{" "}
                ·{" "}
                <Link href={`mailto:hello@${BRAND.domain}`} className="text-ink-2 underline">
                  hello@{BRAND.domain}
                </Link>
              </Text>
              <Text className="m-0 mt-6 font-mono text-11 text-muted">
                <Link href={`${appUrl}/confidentialite`} className="text-muted">
                  Confidentialité
                </Link>
                {" · "}
                <Link href={`${appUrl}/mentions-legales`} className="text-muted">
                  Mentions légales
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}

export function EmailParagraph({ children }: { children: ReactNode }) {
  return <Text className="m-0 mb-4 font-sans text-15 leading-relaxed text-ink-2">{children}</Text>;
}

export function EmailCode({ children }: { children: ReactNode }) {
  return (
    <Text className="m-0 mb-2 mt-2 rounded-2xl border border-solid border-line bg-white px-7 py-4 text-center font-display text-[32px] font-semibold tracking-[0.28em] text-ink">
      {children}
    </Text>
  );
}

export function EmailCta({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="mt-4 inline-block rounded-full bg-ink px-6 py-3.5 font-sans text-15 font-medium text-white no-underline"
    >
      {children}
    </Link>
  );
}

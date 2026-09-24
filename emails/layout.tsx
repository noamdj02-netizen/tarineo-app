import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

// Couleurs Mono Lead en dur : les clients mail ne lisent pas les variables CSS.
export const C = { bg: "#f3f3f2", surface: "#ffffff", ink: "#111111", muted: "#8c8c8c", line: "#ececeb" };

export function EmailLayout({
  preview,
  label,
  title,
  children,
  cta,
}: {
  preview: string;
  label: string;
  title: string;
  children: React.ReactNode;
  cta?: { href: string; text: string };
}) {
  return (
    <Html lang="fr">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: C.bg, margin: 0, padding: "32px 12px", fontFamily: "Inter, Helvetica, Arial, sans-serif" }}>
        <Container style={{ maxWidth: 520, margin: "0 auto" }}>
          <Text style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.04em", color: C.ink, margin: "0 0 16px 4px" }}>
            Navpit<span style={{ color: "#9a9a9a" }}>.</span>
          </Text>
          <Section style={{ backgroundColor: C.surface, borderRadius: 24, padding: "32px 28px", border: `1px solid ${C.line}` }}>
            <Text style={{ fontFamily: "Menlo, monospace", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: C.muted, margin: 0 }}>
              {`/ ${label} ///`}
            </Text>
            <Text style={{ fontSize: 26, lineHeight: "1.15", fontWeight: 600, letterSpacing: "-0.035em", color: C.ink, margin: "10px 0 14px" }}>
              {title}
            </Text>
            {children}
            {cta ? (
              <Button
                href={cta.href}
                style={{ backgroundColor: C.ink, color: "#ffffff", borderRadius: 999, padding: "14px 24px", fontSize: 15, fontWeight: 500, marginTop: 12 }}
              >
                {cta.text}
              </Button>
            ) : null}
          </Section>
          <Hr style={{ borderColor: "transparent", margin: "12px 0" }} />
          <Text style={{ fontSize: 12, color: C.muted, textAlign: "center", margin: 0 }}>
            Navpit · Le cockpit des fondateurs solo
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return <Text style={{ fontSize: 15, lineHeight: "1.6", color: "#555555", margin: "0 0 12px" }}>{children}</Text>;
}

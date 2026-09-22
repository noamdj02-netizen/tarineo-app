import type { CSSProperties, ReactNode } from "react";
import { FONT, RADIUS, TOKENS } from "../theme";

export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        borderRadius: RADIUS.card,
        background: TOKENS.card,
        border: `1px solid ${TOKENS.border}99`,
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "20px 20px 0", gap: 12 }}>
      <div>
        <div style={{ fontFamily: FONT, fontSize: 20, fontWeight: 500, color: TOKENS.foreground }}>{title}</div>
        {description && (
          <div style={{ fontFamily: FONT, fontSize: 14, color: TOKENS.mutedForeground, marginTop: 4 }}>{description}</div>
        )}
      </div>
      {action}
    </div>
  );
}

export function CardContent({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div style={{ padding: 20, ...style }}>{children}</div>;
}

export function Badge({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: "default" | "secondary" | "destructive" | "success" | "outline";
}) {
  const styles: Record<string, CSSProperties> = {
    default: { background: TOKENS.primary, color: TOKENS.primaryForeground, border: "1px solid transparent" },
    secondary: { background: TOKENS.secondary, color: TOKENS.foreground, border: "1px solid transparent" },
    destructive: { background: TOKENS.dangerBg, color: TOKENS.danger, border: `1px solid #f5c4c4` },
    success: { background: "#e9f8ee", color: TOKENS.green, border: `1px solid ${TOKENS.green}44` },
    outline: { background: "transparent", color: TOKENS.primary, border: `1px solid ${TOKENS.border}` },
  };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: RADIUS.pill,
        padding: "2px 10px",
        fontSize: 12,
        fontWeight: 500,
        fontFamily: FONT,
        ...styles[variant],
      }}
    >
      {children}
    </span>
  );
}

export function Btn({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: "default" | "outline" | "ghost";
}) {
  const base: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    borderRadius: RADIUS.pill,
    padding: "8px 16px",
    fontSize: 14,
    fontWeight: 500,
    fontFamily: FONT,
  };
  if (variant === "outline") {
    return <span style={{ ...base, border: `1px solid ${TOKENS.border}`, background: TOKENS.card, color: TOKENS.foreground }}>{children}</span>;
  }
  if (variant === "ghost") {
    return <span style={{ ...base, color: TOKENS.mutedForeground }}>{children}</span>;
  }
  return <span style={{ ...base, background: TOKENS.primary, color: TOKENS.primaryForeground }}>{children}</span>;
}

export function StatTile({
  icon,
  label,
  sub,
  value,
  suffix,
}: {
  icon: string;
  label: string;
  sub: string;
  value: string;
  suffix?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: 116,
        borderRadius: RADIUS.inner,
        background: TOKENS.secondary,
        padding: 16,
      }}
    >
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        <img src={icon} alt="" style={{ width: 31, height: 31 }} />
        <div>
          <div style={{ fontFamily: FONT, fontSize: 11.5, fontWeight: 600, color: TOKENS.foreground, lineHeight: 1.2 }}>{label}</div>
          <div style={{ fontFamily: FONT, fontSize: 10, color: TOKENS.mutedForeground, marginTop: 4 }}>{sub}</div>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: FONT, fontSize: 16, fontWeight: 600, color: TOKENS.primary }}>{value}</span>
        {suffix && <span style={{ fontFamily: FONT, fontSize: 14, color: TOKENS.mutedForeground }}>{suffix}</span>}
      </div>
    </div>
  );
}

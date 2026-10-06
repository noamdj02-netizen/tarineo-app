import type { CSSProperties } from "react";
import { C } from "../constants";
import type { DevisSample } from "../data";
import { fontSans } from "../../fonts";

function euro(n: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function DevisDocMock({
  sample,
  style,
  compact = false,
  scanPercent,
  redactBars = 0,
  dimmed = false,
  orangeWash = false,
}: {
  sample: DevisSample;
  style?: CSSProperties;
  /** Vignette prompt / upload. */
  compact?: boolean;
  scanPercent?: number;
  redactBars?: number;
  dimmed?: boolean;
  orangeWash?: boolean;
}) {
  const pad = compact ? 10 : 16;
  const titleSize = compact ? 11 : 13;
  const refSize = compact ? 14 : 17;
  const lineSize = compact ? 10 : 12;
  const totalSize = compact ? 16 : 20;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: "#FAF8F4",
        color: "#0A0A0A",
        fontFamily: fontSans,
        border: `1px solid rgba(10,10,10,0.1)`,
        boxSizing: "border-box",
        overflow: "hidden",
        ...style,
      }}
    >
      {orangeWash ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(255,107,26,0.42)",
            mixBlendMode: "multiply",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />
      ) : null}
      {dimmed ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(10,10,10,0.08)",
            zIndex: 1,
            pointerEvents: "none",
          }}
        />
      ) : null}

      <div style={{ padding: pad, position: "relative", zIndex: 0, height: "100%", display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 8,
            borderBottom: "1px solid rgba(10,10,10,0.1)",
            paddingBottom: compact ? 6 : 10,
            marginBottom: compact ? 6 : 10,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.1em",
                color: C.accent,
              }}
            >
              {sample.kind}
            </p>
            <p style={{ margin: "4px 0 0", fontSize: refSize, fontWeight: 700, letterSpacing: "-0.02em" }}>
              {sample.ref}
            </p>
            {!compact ? (
              <p style={{ margin: "4px 0 0", fontSize: titleSize, color: C.muted }}>{sample.title}</p>
            ) : null}
          </div>
          <span
            style={{
              flexShrink: 0,
              fontSize: 8,
              fontWeight: 700,
              padding: "3px 6px",
              borderRadius: 4,
              background: "#0A0A0A",
              color: "#fff",
            }}
          >
            PDF
          </span>
        </div>

        <p style={{ margin: 0, fontSize: lineSize, color: C.muted }}>{sample.supplier}</p>

        <ul style={{ margin: `${compact ? 6 : 10}px 0 0`, padding: 0, listStyle: "none", flex: 1 }}>
          {sample.lines.slice(0, compact ? 2 : 4).map((line) => (
            <li
              key={line.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 6,
                fontSize: lineSize,
                marginBottom: 4,
              }}
            >
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "rgba(10,10,10,0.55)" }}>
                {line.label}
              </span>
              <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{euro(line.amount)}</span>
            </li>
          ))}
        </ul>

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            borderTop: "1px solid rgba(10,10,10,0.1)",
            paddingTop: compact ? 6 : 8,
          }}
        >
          <span style={{ fontSize: lineSize, color: C.muted }}>Total HT</span>
          <span style={{ fontSize: totalSize, fontWeight: 700, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>
            {euro(sample.totalHt)}
          </span>
        </div>
      </div>

      {redactBars > 0
        ? Array.from({ length: redactBars }).map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: pad,
                right: pad,
                top: `${22 + i * 16}%`,
                height: compact ? 10 : 14,
                borderRadius: 3,
                background: "rgba(10,30,60,0.4)",
                zIndex: 3,
              }}
            />
          ))
        : null}

      {scanPercent !== undefined ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: `${scanPercent}%`,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${C.accent}, transparent)`,
            boxShadow: "0 0 12px rgba(255,107,26,0.45)",
            zIndex: 4,
          }}
        />
      ) : null}
    </div>
  );
}

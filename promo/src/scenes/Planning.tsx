import { interpolate, useCurrentFrame } from "remotion";
import { AppShell, MonoLabel } from "../chrome/AppShell";
import { fontMono, fontSans } from "../fonts";
import { EASE, reveal } from "../motion";
import { C, SHADOW_SOFT } from "../theme";

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];
const DAYS = Array.from({ length: 35 }, (_, i) => {
  const n = i - 2;
  return { n: ((n + 30) % 30) + 1, inMonth: n >= 0 && n < 30, today: n === 23 };
});

const EVENTS = [
  { t: "09:00", title: "Appel artisan — devis test" },
  { t: "14:30", title: "Relire la landing Studio Devis" },
];

export const Planning: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AppShell tab="Accueil">
      <div style={reveal(frame, 0)}>
        <MonoLabel>/ Planning ///</MonoLabel>
        <h1
          style={{
            marginTop: 8,
            fontFamily: fontSans,
            fontSize: 32,
            fontWeight: 600,
            letterSpacing: "-0.045em",
          }}
        >
          Agenda Google ou Apple, <span style={{ color: C.accent2 }}>dans Navpit.</span>
        </h1>
      </div>
      <div
        style={{
          ...reveal(frame, 2),
          marginTop: 18,
          display: "grid",
          gridTemplateColumns: "1.3fr 1fr",
          gap: 14,
        }}
      >
        <div
          style={{
            borderRadius: 18,
            border: `1px solid ${C.line}`,
            background: C.surface,
            boxShadow: SHADOW_SOFT,
            padding: 20,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 4,
              marginBottom: 8,
            }}
          >
            {WEEKDAYS.map((d, i) => (
              <div
                key={`${d}-${i}`}
                style={{
                  textAlign: "center",
                  fontFamily: fontMono,
                  fontSize: 10.5,
                  color: C.muted,
                  textTransform: "uppercase",
                }}
              >
                {d}
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
            {DAYS.map((d, i) => {
              const on = interpolate(frame, [8 + i, 16 + i], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: EASE,
              });
              return (
                <div
                  key={i}
                  style={{
                    height: 42,
                    borderRadius: 10,
                    display: "grid",
                    placeItems: "center",
                    fontSize: 14,
                    fontWeight: d.today ? 600 : 400,
                    background: d.today ? C.ink : "transparent",
                    color: d.today ? "#fff" : d.inMonth ? C.ink : C.muted,
                    opacity: on,
                  }}
                >
                  {d.n}
                </div>
              );
            })}
          </div>
        </div>
        <div
          style={{
            borderRadius: 18,
            border: `1px solid ${C.line}`,
            background: C.surface,
            boxShadow: SHADOW_SOFT,
            padding: 20,
          }}
        >
          <MonoLabel>/ Aujourd’hui ///</MonoLabel>
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            {EVENTS.map((e, i) => (
              <div
                key={e.t}
                style={{
                  ...reveal(frame, 6 + i),
                  display: "flex",
                  gap: 12,
                  padding: "12px 14px",
                  borderRadius: 12,
                  background: C.surface2,
                }}
              >
                <span style={{ fontFamily: fontMono, fontSize: 12, color: C.muted, width: 48 }}>{e.t}</span>
                <span style={{ fontSize: 14 }}>{e.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
};

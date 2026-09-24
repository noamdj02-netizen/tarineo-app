import { interpolate, useCurrentFrame } from "remotion";
import { fontGrotesk, fontSans } from "../fonts";
import { EASE } from "../motion";
import { C, SHADOW_DARK, SHADOW_SOFT } from "../theme";

const CHIPS = ["Rédiger un mail", "Résumer un fichier", "Schéma du parcours", "Post LinkedIn"];

/** GlowCard + prompt de /accueil, tels qu’on les utilise. */
export function HomeHero({
  typed,
  showChips = true,
}: {
  typed?: string;
  showChips?: boolean;
}) {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, 120], [0, 10], { extrapolateRight: "extend" });

  return (
    <div
      style={{
        position: "relative",
        isolation: "isolate",
        overflow: "hidden",
        borderRadius: 28,
        border: `1px solid ${C.line}`,
        background: C.surface2,
        boxShadow: SHADOW_SOFT,
        padding: "32px 32px 24px",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "auto 0 0",
          height: "70%",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "-18%",
            bottom: "-20%",
            width: "70%",
            height: "95%",
            borderRadius: "50%",
            background: `radial-gradient(closest-side, ${C.glow1} 35%, transparent)`,
            filter: "blur(20px)",
            transform: `translateY(${-drift}px)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "18%",
            bottom: "-10%",
            width: "64%",
            height: "100%",
            borderRadius: "50%",
            background: `radial-gradient(closest-side, ${C.glow2} 35%, transparent)`,
            filter: "blur(20px)",
            transform: `translateX(${drift * 0.5}px)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            right: "-18%",
            bottom: "-20%",
            width: "62%",
            height: "95%",
            borderRadius: "50%",
            background: `radial-gradient(closest-side, ${C.glow3} 35%, transparent)`,
            filter: "blur(20px)",
          }}
        />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        <p
          style={{
            fontFamily: fontGrotesk,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "rgba(17,17,17,0.75)",
          }}
        >
          Bonjour Noam !
        </p>
        <h1
          style={{
            marginTop: 8,
            maxWidth: "18ch",
            fontFamily: fontSans,
            fontSize: 38,
            fontWeight: 600,
            letterSpacing: "-0.045em",
            lineHeight: 1.06,
            color: C.ink,
          }}
        >
          Comment puis-je t’aider aujourd’hui ?
        </h1>

        <div
          style={{
            marginTop: 20,
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: C.surface,
            borderRadius: 999,
            padding: "8px 8px 8px 20px",
            boxShadow: SHADOW_SOFT,
          }}
        >
          <div
            style={{
              flex: 1,
              fontFamily: fontSans,
              fontSize: 16,
              lineHeight: "28px",
              color: typed ? C.ink : C.muted,
              minHeight: 28,
            }}
          >
            {typed || "Demande à ton copilote…"}
            <span
              style={{
                display: "inline-block",
                width: 2,
                height: 18,
                background: C.ink,
                marginLeft: 3,
                verticalAlign: "middle",
                opacity: frame % 24 < 11 ? 1 : 0,
              }}
            />
          </div>
          <Round icon="clip" />
          <Round icon="mic" />
          <Round icon="send" dark />
        </div>

        {showChips ? (
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            {CHIPS.map((c, i) => {
              const on = interpolate(frame, [18 + i * 3, 28 + i * 3], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: EASE,
              });
              return (
                <span
                  key={c}
                  style={{
                    minHeight: 36,
                    borderRadius: 999,
                    background: C.surface,
                    padding: "0 14px",
                    display: "inline-flex",
                    alignItems: "center",
                    fontSize: 13,
                    color: "rgba(17,17,17,0.8)",
                    boxShadow: SHADOW_SOFT,
                    opacity: on,
                    transform: `translateY(${(1 - on) * 6}px)`,
                  }}
                >
                  {c}
                </span>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Round({ icon, dark }: { icon: "clip" | "mic" | "send"; dark?: boolean }) {
  return (
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: 999,
        background: dark ? C.ink : C.surface2,
        color: dark ? "#fff" : C.ink,
        display: "grid",
        placeItems: "center",
        boxShadow: dark ? SHADOW_DARK : undefined,
        flex: "none",
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        {icon === "clip" ? <path d="M8 12.5 14 6.5a3 3 0 1 1 4.2 4.2l-8.5 8.5a4 4 0 0 1-5.7-5.7l8-8" /> : null}
        {icon === "mic" ? (
          <>
            <rect x="9" y="4" width="6" height="10" rx="3" />
            <path d="M6 11a6 6 0 0 0 12 0M12 17v3" />
          </>
        ) : null}
        {icon === "send" ? <path d="M12 19V5M7 10l5-5 5 5" /> : null}
      </svg>
    </div>
  );
}

import { AppChrome } from "../AppChrome";
import { Badge, Card, CardContent } from "../../ui/primitives";
import { DEMO_DISTRIBUTEURS_BARRES, DEMO_EN_BREF_DEVIS } from "../../demo-data";
import { FONT, RADIUS, TOKENS } from "../../theme";

const euros = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

export function DocumentsPage() {
  return (
    <AppChrome activeNav="documents">
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ fontFamily: FONT, fontSize: 26, fontWeight: 600, margin: 0, color: TOKENS.foreground }}>Devis fournisseurs</h1>
            <p style={{ fontFamily: FONT, fontSize: 14, color: TOKENS.mutedForeground, marginTop: 8 }}>
              Propositions de prix reçues de vos distributeurs
            </p>
          </div>
          <div
            style={{
              minWidth: 148,
              borderRadius: 12,
              border: "1px solid #ffd4c2",
              background: TOKENS.orangePale,
              padding: "8px 12px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontWeight: 600, color: TOKENS.mutedForeground, textTransform: "uppercase" }}>
              <span>Import initial</span>
              <span style={{ fontSize: 14, color: TOKENS.foreground }}>47 / 150</span>
            </div>
            <div style={{ marginTop: 6, height: 4, borderRadius: 4, background: "rgba(255,255,255,0.7)" }}>
              <div style={{ width: "31%", height: "100%", borderRadius: 4, background: TOKENS.primary }} />
            </div>
          </div>
        </div>

        <div>
          <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: TOKENS.mutedForeground, marginBottom: 12 }}>
            En bref — Devis
          </p>
          <Card>
            <CardContent>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                {[
                  { label: "Documents", value: String(DEMO_EN_BREF_DEVIS.total) },
                  { label: "Montant HT", value: euros(DEMO_EN_BREF_DEVIS.montantHt) },
                  { label: "Enseignes", value: String(DEMO_EN_BREF_DEVIS.enseignes) },
                ].map((c) => (
                  <div key={c.label} style={{ borderRadius: RADIUS.inner, background: TOKENS.secondary, padding: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", color: TOKENS.mutedForeground }}>{c.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 600, marginTop: 6, color: TOKENS.foreground }}>{c.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16, borderTop: `1px solid ${TOKENS.border}`, paddingTop: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", color: TOKENS.mutedForeground, marginBottom: 10 }}>
                  Par distributeur
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {DEMO_DISTRIBUTEURS_BARRES.map((d) => {
                    const max = DEMO_DISTRIBUTEURS_BARRES[0].count;
                    const pct = Math.round((d.count / max) * 100);
                    return (
                      <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ width: 72, fontSize: 12, color: TOKENS.mutedForeground }}>{d.label}</span>
                        <div style={{ flex: 1, height: 8, borderRadius: 4, background: TOKENS.chartTrack }}>
                          <div style={{ width: `${pct}%`, height: "100%", borderRadius: 4, background: TOKENS.primary }} />
                        </div>
                        <span style={{ width: 20, fontSize: 12, fontWeight: 600, textAlign: "right" }}>{d.count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent style={{ paddingTop: 16 }}>
            <div style={{ fontFamily: FONT, fontSize: 14, fontWeight: 500, marginBottom: 12 }}>Documents envoyés</div>
            {[
              { type: "Devis", dist: "Cedeo", date: "18/03/2026", ttc: "3 416 €", statut: "Validé" },
              { type: "Devis", dist: "Point P", date: "14/03/2026", ttc: "1 548 €", statut: "À vérifier" },
              { type: "Devis", dist: "Rexel", date: "10/03/2026", ttc: "907 €", statut: "Validé" },
            ].map((d) => (
              <div
                key={d.date + d.dist}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom: `1px solid ${TOKENS.border}`,
                  fontFamily: FONT,
                  fontSize: 14,
                }}
              >
                <span>
                  {d.type} · {d.dist} · {d.date} · {d.ttc}
                </span>
                <Badge variant={d.statut === "À vérifier" ? "default" : "success"}>{d.statut}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppChrome>
  );
}

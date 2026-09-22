import { AppChrome } from "../AppChrome";
import { Badge, Card, CardContent } from "../../ui/primitives";
import { DEMO_DEVIS } from "../../demo-data";
import { FONT, RADIUS, TOKENS } from "../../theme";

const euros = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

const STATUT_STYLE: Record<string, "default" | "success" | "destructive"> = {
  envoye: "default",
  accepte: "success",
  expire: "destructive",
};

const STATUT_LABEL: Record<string, string> = {
  envoye: "Envoyé",
  accepte: "Accepté",
  expire: "Expiré",
};

export function DevisPage() {
  return (
    <AppChrome activeNav="facturation">
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontFamily: FONT, fontSize: 26, fontWeight: 600, margin: 0 }}>Devis clients</h1>
            <p style={{ fontFamily: FONT, fontSize: 14, color: TOKENS.mutedForeground, marginTop: 8 }}>
              Propositions envoyées à vos clients
            </p>
          </div>
          <span style={{ background: TOKENS.primary, color: "#fff", borderRadius: RADIUS.pill, padding: "10px 20px", fontSize: 14, fontWeight: 500 }}>
            + Nouveau devis
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {[
            { label: "Devis", value: "14" },
            { label: "En cours", value: "8", hint: "2 expirés" },
            { label: "Transformés", value: "6", hint: "43 % du total" },
            { label: "Montant total HT", value: "68 420 €" },
          ].map((c) => (
            <div key={c.label} style={{ borderRadius: RADIUS.inner, background: TOKENS.secondary, padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", color: TOKENS.mutedForeground }}>{c.label}</div>
              <div style={{ fontSize: 18, fontWeight: 600, marginTop: 6 }}>{c.value}</div>
              {c.hint && <div style={{ fontSize: 12, color: TOKENS.mutedForeground, marginTop: 4 }}>{c.hint}</div>}
            </div>
          ))}
        </div>

        <Card>
          <CardContent>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: FONT, fontSize: 14 }}>
              <thead>
                <tr style={{ color: TOKENS.mutedForeground, textAlign: "left" }}>
                  <th style={{ padding: "8px 0", fontWeight: 500 }}>N° de devis</th>
                  <th style={{ padding: "8px 0", fontWeight: 500 }}>Client</th>
                  <th style={{ padding: "8px 0", fontWeight: 500 }}>Montant HT</th>
                  <th style={{ padding: "8px 0", fontWeight: 500 }}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {DEMO_DEVIS.map((d) => (
                  <tr key={d.numero} style={{ borderTop: `1px solid ${TOKENS.border}` }}>
                    <td style={{ padding: "14px 0", fontWeight: 500, color: TOKENS.primary }}>{d.numero}</td>
                    <td style={{ padding: "14px 0" }}>{d.client}</td>
                    <td style={{ padding: "14px 0" }}>{euros(d.montant)}</td>
                    <td style={{ padding: "14px 0" }}>
                      <Badge variant={STATUT_STYLE[d.statut]}>{STATUT_LABEL[d.statut]}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </AppChrome>
  );
}

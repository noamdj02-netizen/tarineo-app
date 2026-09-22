import { SparklesIcon, TrendingUpIcon } from "lucide-react";
import { AppChrome } from "../AppChrome";
import { Badge, Card, CardContent, CardHeader } from "../../ui/primitives";
import { DEMO_LIGNES_DOCUMENT } from "../../demo-data";
import { FONT, RADIUS, TOKENS } from "../../theme";

const euros = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

export function DocumentDetailPage() {
  return (
    <AppChrome activeNav="documents">
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <h1 style={{ fontFamily: FONT, fontSize: 26, fontWeight: 600, margin: 0 }}>Devis Cedeo</h1>
          <p style={{ fontFamily: FONT, fontSize: 14, color: TOKENS.mutedForeground, marginTop: 6 }}>14 mars 2026 · 12 lignes extraites</p>
        </div>

        {/* BandeauAnalyseIA — src/app/(app)/documents/[id]/BandeauAnalyseIA.tsx */}
        <Card>
          <CardHeader
            title="Analyse IA"
            description="Comparaison à votre historique personnel"
            action={<Badge variant="secondary"><SparklesIcon size={12} style={{ marginRight: 4 }} />Confiance 94 %</Badge>}
          />
          <CardContent>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
              {[
                { label: "Lignes", value: "12" },
                { label: "Avec historique", value: "9" },
                { label: "Hausses", value: "3", accent: true },
                { label: "Impact total", value: "+186 €", accent: true },
              ].map((s) => (
                <div key={s.label} style={{ borderRadius: RADIUS.inner, background: TOKENS.secondary, padding: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", color: TOKENS.mutedForeground }}>{s.label}</div>
                  <div style={{ fontSize: 24, fontWeight: 600, marginTop: 8, color: s.accent ? TOKENS.danger : TOKENS.foreground }}>{s.value}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", background: TOKENS.chartTrack }}>
              <div style={{ width: "25%", background: TOKENS.danger }} />
              <div style={{ width: "50%", background: TOKENS.chartFill }} />
              <div style={{ width: "25%", background: TOKENS.primary }} />
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 10, fontSize: 12, color: TOKENS.mutedForeground }}>
              <span>3 hausses</span>
              <span>6 stables</span>
              <span>3 nouvelles</span>
            </div>
          </CardContent>
        </Card>

        {DEMO_LIGNES_DOCUMENT.map((ligne) => (
          <Card key={ligne.reference} style={{ border: ligne.alerte ? `1px solid #f5c4c4` : undefined }}>
            <CardContent>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: FONT, fontSize: 16, fontWeight: 600 }}>{ligne.designation}</div>
                  <div style={{ fontFamily: FONT, fontSize: 13, color: TOKENS.mutedForeground, marginTop: 4 }}>Réf. {ligne.reference}</div>
                  <div style={{ fontFamily: FONT, fontSize: 12, color: TOKENS.mutedForeground, marginTop: 8 }}>{ligne.hint}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: FONT, fontSize: 18, fontWeight: 600 }}>{euros(ligne.prix)}</div>
                  <Badge variant={ligne.alerte ? "destructive" : "success"}>
                    {ligne.alerte && <TrendingUpIcon size={12} style={{ marginRight: 4 }} />}
                    {ligne.hausse}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppChrome>
  );
}

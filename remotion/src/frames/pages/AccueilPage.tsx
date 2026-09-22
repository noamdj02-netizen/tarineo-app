import { staticFile } from "remotion";
import { StarIcon } from "lucide-react";
import { AppChrome } from "../AppChrome";
import { Badge, Card, CardContent, CardHeader, StatTile } from "../../ui/primitives";
import { DEMO_DOCUMENTS_RECENTS, DEMO_FOURNISSEURS, DEMO_STATS_ACCUEIL } from "../../demo-data";
import { FONT, TOKENS } from "../../theme";

const euros = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

export function AccueilPage() {
  return (
    <AppChrome activeNav="accueil">
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <Card>
          <CardHeader title="Vue d'ensemble" action={<span style={{ fontSize: 14, color: TOKENS.mutedForeground }}>Voir tout</span>} />
          <CardContent>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <StatTile
                icon={staticFile("dashboard/icon-stat-documents.png")}
                label="Documents ce mois"
                sub="Ce mois-ci"
                value={String(DEMO_STATS_ACCUEIL.documentsMois)}
                suffix="documents"
              />
              <StatTile
                icon={staticFile("dashboard/icon-stat-hausse.png")}
                label="Hausse moyenne détectée"
                sub="Ce mois-ci"
                value={DEMO_STATS_ACCUEIL.hausseMoyenne.toFixed(1).replace(".", ",")}
                suffix="%"
              />
              <StatTile
                icon={staticFile("dashboard/icon-stat-economies.png")}
                label="Économies potentielles"
                sub="Ce mois-ci"
                value={String(DEMO_STATS_ACCUEIL.economies)}
                suffix="€"
              />
            </div>
          </CardContent>
        </Card>

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24 }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ fontFamily: FONT, fontSize: 22, fontWeight: 500, margin: 0, color: TOKENS.foreground }}>Vos fournisseurs suivis</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              {DEMO_FOURNISSEURS.map((f) => (
                <Card key={f.nom}>
                  <div style={{ padding: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <img src={staticFile(f.logo)} alt="" style={{ width: 28, height: 28, objectFit: "contain" }} />
                        <div style={{ fontFamily: FONT, fontSize: 16, fontWeight: 500 }}>{f.nom}</div>
                      </div>
                      {f.score !== null && (
                        <Badge variant="secondary">
                          <StarIcon size={12} color={TOKENS.star} style={{ marginRight: 4 }} />
                          {f.score}%
                        </Badge>
                      )}
                    </div>
                    <p style={{ fontFamily: FONT, fontSize: 13, color: TOKENS.mutedForeground, marginTop: 8 }}>
                      {f.description}
                    </p>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${TOKENS.border}`, padding: "16px 20px" }}>
                    <span style={{ fontFamily: FONT, fontSize: 20, fontWeight: 500, color: TOKENS.textBody }}>{euros(f.depenses)}</span>
                    <Badge variant="outline">Voir</Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <Card style={{ minHeight: 420 }}>
            <CardHeader title="Documents récents" description="Importés cette semaine" />
            <CardContent style={{ paddingTop: 8 }}>
              {DEMO_DOCUMENTS_RECENTS.map((doc) => (
                <div
                  key={doc.distributeur + doc.date}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px",
                    borderRadius: 12,
                  }}
                >
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <img
                      src={staticFile(doc.logo)}
                      alt=""
                      style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "contain", background: TOKENS.secondary }}
                    />
                    <div>
                      <div style={{ fontFamily: FONT, fontSize: 16, fontWeight: 500 }}>{doc.distributeur}</div>
                      <div style={{ fontFamily: FONT, fontSize: 13, color: TOKENS.mutedForeground }}>{doc.date}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: FONT, fontSize: 16, fontWeight: 500 }}>{euros(doc.montant)}</div>
                    <Badge variant={doc.alerte ? "destructive" : "success"}>{doc.hausse}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppChrome>
  );
}

import Link from "next/link";
import { CATALOGUE_EMAILS } from "@/lib/emails";

export default function PageCatalogueEmails() {
  return (
    <main style={{ fontFamily: "Inter, system-ui, sans-serif", padding: "2rem", maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Aperçu des emails Tarineo</h1>
      <p style={{ color: "#7b7d81", marginBottom: "2rem" }}>
        17 modèles Figma — cliquez pour prévisualiser le rendu HTML.
      </p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.75rem" }}>
        {CATALOGUE_EMAILS.map((email) => (
          <li key={email.slug}>
            <Link
              href={`/dev/emails/${email.slug}`}
              style={{
                display: "block",
                padding: "12px 16px",
                borderRadius: 12,
                background: "#f3f4f6",
                color: "#14171e",
                textDecoration: "none",
              }}
            >
              <strong>{email.label}</strong>
              <span style={{ display: "block", fontSize: 13, color: "#7b7d81", marginTop: 4 }}>
                {email.sujet}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

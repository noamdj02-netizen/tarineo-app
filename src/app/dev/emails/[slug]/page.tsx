import Link from "next/link";
import { notFound } from "next/navigation";
import { CATALOGUE_EMAILS, renduEmailPreview, type SlugEmail } from "@/lib/emails";
import { origineActuelle } from "@/lib/origine";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PagePreviewEmail({ params }: Props) {
  const { slug } = await params;
  const entree = CATALOGUE_EMAILS.find((e) => e.slug === slug);

  if (!entree) {
    notFound();
  }

  const origine = await origineActuelle();
  const html = renduEmailPreview(slug as SlugEmail, origine);

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "#14171e",
          color: "#fff",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div>
          <Link href="/dev/emails" style={{ color: "#ec5821", textDecoration: "none", fontSize: 13 }}>
            ← Tous les emails
          </Link>
          <div style={{ fontWeight: 600, marginTop: 4 }}>{entree.label}</div>
        </div>
        <code style={{ fontSize: 12, opacity: 0.7 }}>{entree.sujet}</code>
      </div>
      <iframe
        title={entree.label}
        srcDoc={html}
        style={{ width: "100%", minHeight: "100vh", border: "none", display: "block" }}
      />
    </div>
  );
}

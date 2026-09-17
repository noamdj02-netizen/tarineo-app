"use client";

export function ApercuDocument({ documentId, estPdf }: { documentId: string; estPdf: boolean }) {
  const urlFichier = `/api/documents/${documentId}/fichier`;

  if (estPdf) {
    return (
      <div className="flex flex-col bg-white">
        <object
          data={urlFichier}
          type="application/pdf"
          className="h-[min(70vh,600px)] w-full bg-white"
        >
          <iframe
            src={urlFichier}
            title="Aperçu du document PDF"
            className="h-[min(70vh,600px)] w-full bg-white"
          />
        </object>
        <a
          href={urlFichier}
          target="_blank"
          rel="noopener noreferrer"
          className="border-t border-border px-4 py-3 text-center text-sm font-medium text-primary hover:underline"
        >
          Ouvrir le PDF en plein écran
        </a>
      </div>
    );
  }

  return (
    <div className="bg-white p-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={urlFichier} alt="Document original" className="mx-auto max-h-[70vh] w-full object-contain" />
      <a
        href={urlFichier}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 block text-center text-sm font-medium text-primary hover:underline"
      >
        Ouvrir l&apos;image en plein écran
      </a>
    </div>
  );
}

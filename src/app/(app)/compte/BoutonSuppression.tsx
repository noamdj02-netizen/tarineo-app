"use client";

export function BoutonSuppression() {
  return (
    <button
      type="submit"
      className="rounded-md border border-red-500 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10"
      onClick={(e) => {
        if (!confirm("Confirmez-vous la suppression définitive de votre compte et de toutes vos données ?")) {
          e.preventDefault();
        }
      }}
    >
      Supprimer définitivement mon compte
    </button>
  );
}

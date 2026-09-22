"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { supprimerPhotoProfil, televerserPhotoProfil } from "./actions";

type Props = {
  avatarUrl: string | null;
  initiale: string;
  photoPersonnalisee: boolean;
};

export function PhotoProfil({ avatarUrl, initiale, photoPersonnalisee }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [apercuLocal, setApercuLocal] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState<{ type: "succes" | "erreur"; texte: string } | null>(null);
  const apercu = apercuLocal ?? avatarUrl;

  async function surSelection(fichier: File) {
    setMessage(null);
    setApercuLocal(URL.createObjectURL(fichier));
    setEnCours(true);

    const formData = new FormData();
    formData.append("photo", fichier);
    const resultat = await televerserPhotoProfil(formData);
    setEnCours(false);

    if (!resultat.succes) {
      setMessage({ type: "erreur", texte: resultat.erreur });
      setApercuLocal(null);
      return;
    }

    setApercuLocal(null);
    setMessage({ type: "succes", texte: resultat.message });
    router.refresh();
  }

  async function surSuppression() {
    setMessage(null);
    setEnCours(true);
    const resultat = await supprimerPhotoProfil();
    setEnCours(false);

    if (!resultat.succes) {
      setMessage({ type: "erreur", texte: resultat.erreur });
      return;
    }

    setApercuLocal(null);
    setMessage({ type: "succes", texte: resultat.message });
    router.refresh();
  }

  return (
    <section className="app-card p-5 sm:p-6">
      <h2 className="text-sm font-medium text-muted-foreground">Photo de profil</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Affichée dans le menu du dashboard (en haut à droite).
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <Avatar className="size-20 text-xl after:hidden">
          {apercu ? <AvatarImage src={apercu} alt="Photo de profil" /> : null}
          <AvatarFallback className="bg-primary/15 text-xl font-semibold text-foreground">{initiale}</AvatarFallback>
        </Avatar>

        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            disabled={enCours}
            onChange={(e) => {
              const fichier = e.target.files?.[0];
              if (fichier) surSelection(fichier);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="secondary"
            className="rounded-full"
            disabled={enCours}
            onClick={() => inputRef.current?.click()}
          >
            {enCours ? "Envoi…" : "Choisir une photo"}
          </Button>
          {photoPersonnalisee && (
            <Button
              type="button"
              variant="ghost"
              className="rounded-full text-muted-foreground"
              disabled={enCours}
              onClick={surSuppression}
            >
              Supprimer la photo
            </Button>
          )}
        </div>
      </div>

      {message && (
        <p
          className={`mt-3 text-sm ${message.type === "erreur" ? "text-red-600" : "text-emerald-700"}`}
          role="status"
        >
          {message.texte}
        </p>
      )}
    </section>
  );
}

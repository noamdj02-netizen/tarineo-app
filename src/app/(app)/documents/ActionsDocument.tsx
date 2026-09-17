"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Mail, Pencil, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  envoyerDocumentParEmail,
  genererEmailDocument,
  reouvrirDocumentPourCorrection,
  supprimerDocument,
} from "./[id]/actions";
import type { DocumentStatus } from "@prisma/client";

const labelClasse = "mb-1 block text-xs text-muted-foreground";
const champClasse = "w-full app-input";

export function ActionsDocument({
  documentId,
  statut,
  libelle,
  compact = false,
}: {
  documentId: string;
  statut: DocumentStatus;
  libelle: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [enCours, startTransition] = useTransition();
  const [dialogEmail, setDialogEmail] = useState<"envoyer" | "renvoyer" | null>(null);
  const [dialogSupprimer, setDialogSupprimer] = useState(false);
  const [destinataire, setDestinataire] = useState("");
  const [objet, setObjet] = useState("");
  const [corps, setCorps] = useState("");
  const [generationEnCours, setGenerationEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [succes, setSucces] = useState<string | null>(null);

  const enTraitement = statut === "PROCESSING";

  function ouvrirEmail(intention: "envoyer" | "renvoyer") {
    setErreur(null);
    setSucces(null);
    setDialogEmail(intention);
    setGenerationEnCours(true);
    setObjet("");
    setCorps("");

    void genererEmailDocument(documentId, intention, destinataire).then((resultat) => {
      setGenerationEnCours(false);
      if (!resultat.succes) {
        setErreur(resultat.erreur);
        return;
      }
      setObjet(resultat.objet);
      setCorps(resultat.corps);
    });
  }

  function regenererEmail() {
    if (!dialogEmail) return;
    setGenerationEnCours(true);
    setErreur(null);
    void genererEmailDocument(documentId, dialogEmail, destinataire).then((resultat) => {
      setGenerationEnCours(false);
      if (!resultat.succes) {
        setErreur(resultat.erreur);
        return;
      }
      setObjet(resultat.objet);
      setCorps(resultat.corps);
    });
  }

  function envoyerEmail() {
    setErreur(null);
    startTransition(async () => {
      const resultat = await envoyerDocumentParEmail(documentId, {
        destinataire,
        objet,
        corps,
      });
      if (!resultat.succes) {
        setErreur(resultat.erreur);
        return;
      }
      setSucces("Email envoyé avec le document en pièce jointe.");
      setTimeout(() => {
        setDialogEmail(null);
        setSucces(null);
      }, 1500);
    });
  }

  function modifier() {
    startTransition(async () => {
      const resultat = await reouvrirDocumentPourCorrection(documentId);
      if (!resultat.succes) {
        setErreur(resultat.erreur);
        return;
      }
      router.refresh();
    });
  }

  function confirmerSuppression() {
    startTransition(async () => {
      await supprimerDocument(documentId);
    });
  }

  const boutonClasse = compact
    ? "h-8 gap-1 rounded-full px-2.5 text-xs"
    : "h-9 gap-1.5 rounded-full px-3 text-sm";

  return (
    <>
      <div
        className={compact ? "flex shrink-0 items-center gap-1" : "flex flex-wrap items-center gap-2"}
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={boutonClasse}
          disabled={enTraitement || enCours}
          onClick={modifier}
        >
          <Pencil className="size-3.5" />
          {!compact && "Modifier"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={boutonClasse}
          disabled={enTraitement || enCours}
          onClick={() => ouvrirEmail("envoyer")}
        >
          <Mail className="size-3.5" />
          {!compact && "Envoyer"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={boutonClasse}
          disabled={enTraitement || enCours}
          onClick={() => ouvrirEmail("renvoyer")}
        >
          <RefreshCw className="size-3.5" />
          {!compact && "Renvoyer"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={`${boutonClasse} text-red-600 hover:bg-red-50 hover:text-red-700`}
          disabled={enCours}
          onClick={() => setDialogSupprimer(true)}
        >
          <Trash2 className="size-3.5" />
          {!compact && "Supprimer"}
        </Button>
      </div>

      <Dialog open={dialogEmail !== null} onOpenChange={(open) => !open && setDialogEmail(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{dialogEmail === "renvoyer" ? "Renvoyer par e-mail" : "Envoyer par e-mail"}</DialogTitle>
            <DialogDescription>
              L&apos;IA rédige le message — vous pouvez le modifier avant l&apos;envoi. Le fichier original est joint
              automatiquement.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <label htmlFor={`dest-${documentId}`} className={labelClasse}>Destinataire</label>
              <input
                id={`dest-${documentId}`}
                type="email"
                value={destinataire}
                onChange={(e) => setDestinataire(e.target.value)}
                placeholder="comptable@exemple.fr"
                className={champClasse}
              />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label htmlFor={`obj-${documentId}`} className={labelClasse}>Objet</label>
                <button
                  type="button"
                  onClick={regenererEmail}
                  disabled={generationEnCours}
                  className="text-xs font-medium text-primary hover:underline disabled:opacity-50"
                >
                  {generationEnCours ? "Rédaction…" : "Régénérer avec l'IA"}
                </button>
              </div>
              <input
                id={`obj-${documentId}`}
                value={objet}
                onChange={(e) => setObjet(e.target.value)}
                className={champClasse}
                disabled={generationEnCours}
              />
            </div>
            <div>
              <label htmlFor={`corps-${documentId}`} className={labelClasse}>Message</label>
              <textarea
                id={`corps-${documentId}`}
                value={corps}
                onChange={(e) => setCorps(e.target.value)}
                rows={7}
                className={`${champClasse} resize-y`}
                disabled={generationEnCours}
              />
            </div>
            {erreur && <p className="text-sm text-red-600">{erreur}</p>}
            {succes && <p className="text-sm text-emerald-700">{succes}</p>}
            <Button
              type="button"
              className="w-full rounded-full"
              disabled={enCours || generationEnCours || !destinataire || !objet || !corps}
              onClick={envoyerEmail}
            >
              {enCours ? "Envoi en cours…" : "Envoyer l'e-mail"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogSupprimer} onOpenChange={setDialogSupprimer}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer ce document ?</DialogTitle>
            <DialogDescription>
              « {libelle} » sera définitivement supprimé, y compris le fichier et l&apos;historique de prix associé.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1 rounded-full" onClick={() => setDialogSupprimer(false)}>
              Annuler
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="flex-1 rounded-full"
              disabled={enCours}
              onClick={confirmerSuppression}
            >
              {enCours ? "Suppression…" : "Supprimer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

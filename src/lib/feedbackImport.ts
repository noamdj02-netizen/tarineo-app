import { toast } from "sonner";
import { declencherConfettiImport } from "@/components/tarineo/motion/ConfettiBurst";

/** Feedback immédiat après un scan/import réussi — toast + confettis. */
export function annoncerImportSucces(nombre: number) {
  const message =
    nombre <= 1
      ? "Document reçu — analyse en cours"
      : `${nombre} documents reçus — analyse en cours`;

  toast.success(message, {
    description: "Tarineo lit les lignes et compare à votre historique.",
    duration: 4200,
  });
  declencherConfettiImport();
}

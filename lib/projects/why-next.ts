import { STAGES } from "@/lib/design-data/resources";
import type { ProjectSummary } from "@/lib/projects/types";

/**
 * Explication locale « Pourquoi cette action ? ».
 * Branchable plus tard sur l’IA — pas d’appel réseau ici.
 */
export function whyNextAction(p: ProjectSummary): string {
  const stageName = STAGES[Math.min(6, Math.max(1, p.stage)) - 1] ?? "en cours";
  if (!p.next?.trim()) {
    return `Choisis une prochaine action pour faire avancer « ${p.name} » à l’étape ${p.stage}/6 (${stageName}).`;
  }

  const bits = [
    `Cette action est prioritaire car elle fait avancer « ${p.name} » à l’étape ${p.stage}/6 (${stageName}).`,
  ];

  if (p.blocked) {
    bits.push(
      p.blockerReason?.trim()
        ? `Le projet est bloqué : ${p.blockerReason.trim()}.`
        : "Le projet est marqué comme bloqué — débloque-le ou ajuste l’action.",
    );
  }

  const pct = (() => {
    const t = p.featuresTotal + p.tasksTotal;
    if (t <= 0) return null;
    return Math.round(((p.featuresDone + p.tasksDone) / t) * 100);
  })();
  if (pct != null && pct < 100) {
    bits.push(`Tu es à environ ${pct} % — cette étape concrète rapproche la suite.`);
  }

  return bits.join(" ");
}

import { renegotiationMail } from "@/lib/site/landing-v2-content";
import { LandingProductFrame } from "@/components/site/landing-v2/components/ui/LandingProductFrame";

export function LandingMailPreview() {
  return (
    <LandingProductFrame title="Nouveau message" className="flex-1">
      <div
        className="flex flex-col gap-2.5 p-4 sm:p-5"
        role="figure"
        aria-label="Exemple de mail de renégociation fournisseur"
      >
        <div className="rounded-lg border border-line bg-paper-50 px-3 py-2">
          <p className="text-[10px] font-medium uppercase tracking-wide text-ink-400">À</p>
          <p className="text-sm text-ink-700">Commercial Point P</p>
        </div>
        <div className="rounded-lg border border-line bg-paper-50 px-3 py-2">
          <p className="text-[10px] font-medium uppercase tracking-wide text-ink-400">Objet</p>
          <p className="text-sm text-ink-900">{renegotiationMail.subject}</p>
        </div>
        <div
          className="min-h-[9.5rem] rounded-lg border border-line bg-paper-0 px-3 py-3 text-[0.8125rem] leading-relaxed whitespace-pre-wrap text-ink-700"
        >
          {renegotiationMail.body}
        </div>
      </div>
    </LandingProductFrame>
  );
}

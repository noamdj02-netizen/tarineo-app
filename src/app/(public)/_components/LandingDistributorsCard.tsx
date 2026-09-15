import Image from "next/image";

interface Props {
  className?: string;
}

export function LandingDistributorsCard({ className = "" }: Props) {
  return (
    <div
      className={`w-[270px] shrink-0 rounded-3xl bg-white p-6 shadow-[14px_15px_17px_rgba(0,0,0,0.17)] ${className}`}
    >
      <div className="mb-8 flex items-center justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--landing-chip)]">
          <Image src="/landing/distributors-card-bank.svg" alt="" width={24} height={24} className="h-6 w-6" />
        </span>
        <span className="rounded-full border border-[var(--landing-surface)] px-3.5 py-2 text-xs text-[var(--landing-muted)]">
          Gratuit
        </span>
      </div>

      <p className="landing-display mb-4 text-sm font-medium text-[var(--landing-text)]">Analyse du devis</p>

      <div className="mb-4 flex flex-col gap-4">
        <div className="flex items-center justify-between rounded-full bg-[var(--landing-chip)] px-1.5 py-1.5">
          <Image src="/landing/flag-fr.png" alt="" width={32} height={32} className="h-8 w-8 shrink-0 rounded-full object-cover" />
          <Image src="/landing/distributors-card-dots.svg" alt="" width={24} height={4} className="h-1 w-6 shrink-0" />
          <Image src="/landing/distributors-card-arrow.svg" alt="" width={20} height={20} className="h-5 w-5 shrink-0 rotate-180" />
          <Image src="/landing/distributors-card-dots.svg" alt="" width={24} height={4} className="h-1 w-6 shrink-0" />
          <Image src="/landing/world-card.png" alt="" width={34} height={34} className="h-[34px] w-[34px] shrink-0 rounded-full object-cover" />
        </div>
        <div className="flex items-center justify-between px-1.5">
          <Image src="/landing/distributors-card-logo.svg" alt="Point P" width={34} height={9} className="h-[9px] w-[34px]" />
          <span className="text-xs font-medium text-[var(--landing-muted)]">chez</span>
          <Image src="/landing/distributors-card-logo.svg" alt="Cedeo" width={34} height={9} className="h-[9px] w-[34px]" />
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-sm font-medium text-[var(--landing-muted)]">Montant</p>
        <p className="landing-display text-[28px] font-medium leading-none text-[var(--landing-text)]">3 200 €</p>
        <p className="text-xs text-[var(--landing-muted)]">Résultat en 10 secondes</p>
      </div>
    </div>
  );
}

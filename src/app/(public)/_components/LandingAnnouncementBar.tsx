interface Props {
  limiteTotal: number;
}

export function LandingAnnouncementBar({ limiteTotal }: Props) {
  return (
    <div className="border-b border-black/[0.08] bg-white">
      <div className="mx-auto flex h-10 max-w-[1440px] items-center justify-center gap-2 px-4 text-base sm:px-6">
        <span className="flex h-[22px] w-[22px] items-center justify-center rounded-md bg-[var(--landing-chip)] text-xs" aria-hidden="true">
          🎁
        </span>
        <span className="landing-display font-medium text-[var(--landing-text)]">Accès anticipé</span>
        <span className="text-[var(--landing-muted)]">—</span>
        <span className="text-[var(--landing-muted)]">
          Les {limiteTotal} premiers utilisateurs : accès gratuit.
        </span>
      </div>
    </div>
  );
}

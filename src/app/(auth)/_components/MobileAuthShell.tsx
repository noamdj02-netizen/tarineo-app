export function MobileAuthShell({
  children,
}: {
  /** Conservé pour compatibilité des appels existants — le fond photo n'est plus utilisé. */
  background?: string;
  overlayOpacity?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-white md:hidden">
      <div className="relative z-10 mx-auto flex w-full max-w-[440px] flex-1 flex-col justify-between px-5 pb-6 pt-5 sm:px-6">
        {children}
      </div>
    </div>
  );
}

export function MobileAuthShell({
  background,
  overlayOpacity = 0.82,
  children,
}: {
  background: string;
  overlayOpacity?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden md:hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={background}
        alt=""
        width={390}
        height={844}
        className="absolute inset-0 h-full w-full object-cover object-center"
        decoding="async"
      />
      <div
        className="absolute inset-0"
        style={{ backgroundColor: `rgba(9, 8, 7, ${overlayOpacity})` }}
        aria-hidden
      />
      <div className="relative z-10 mx-auto flex w-full max-w-[440px] flex-1 flex-col justify-between px-5 pb-6 pt-5 sm:px-6">
        {children}
      </div>
    </div>
  );
}

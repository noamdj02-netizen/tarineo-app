import { AuthBrand } from "./AuthBrand";

export function AuthDesktopFormShell({
  children,
  footer,
  gapClass = "gap-7",
}: {
  children: React.ReactNode;
  footer: React.ReactNode;
  gapClass?: string;
}) {
  return (
    <div className="hidden min-h-dvh flex-1 flex-col justify-between bg-white px-[clamp(24px,6vw,92px)] pb-[42px] pt-[clamp(32px,5vh,58px)] md:flex">
      <AuthBrand variant="light" />
      <div className={`mx-auto flex w-full max-w-[496px] flex-col ${gapClass}`}>{children}</div>
      <div className="mx-auto w-full max-w-[496px]">{footer}</div>
    </div>
  );
}

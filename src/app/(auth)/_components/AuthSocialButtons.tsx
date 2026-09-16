export function AuthSocialButtons({
  googleAction,
  variant = "light",
}: {
  googleAction: () => Promise<void>;
  variant?: "light" | "dark";
}) {
  const sep = variant === "light" ? "bg-[#E6E9EB]" : "bg-white/10";
  const sepText = variant === "light" ? "text-[#9CA3AF]" : "text-[#6b6560]";
  const btn =
    variant === "light"
      ? "border border-[#E6E9EB] bg-white text-[#172935] hover:border-[#EC5821]/40 hover:bg-[#FFF7F2]"
      : "border border-white/12 bg-[#1a1816]/60 text-white hover:border-white/25 hover:bg-[#1a1816]";

  return (
    <>
      <div className="flex items-center gap-3">
        <div className={`h-px flex-1 ${sep}`} />
        <span className={`text-[12px] font-semibold uppercase tracking-wide ${sepText}`}>ou</span>
        <div className={`h-px flex-1 ${sep}`} />
      </div>
      <form action={googleAction}>
        <button
          type="submit"
          className={`flex h-[50px] w-full items-center justify-center gap-2.5 rounded-full text-[15px] font-semibold transition ${btn}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/auth/icon-google.svg" alt="" width={18} height={18} className="shrink-0" />
          Continuer avec Google
        </button>
      </form>
    </>
  );
}

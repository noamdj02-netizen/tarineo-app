import { logoDev } from "@/lib/fournisseursConnus";

export function AuthSocialButtons({
  googleAction,
  variant = "light",
  callbackUrl,
}: {
  googleAction: (formData: FormData) => Promise<void>;
  variant?: "light" | "dark";
  callbackUrl?: string;
}) {
  const sep = variant === "light" ? "bg-[#E6E9EB]" : "bg-white/10";
  const sepText = variant === "light" ? "text-[#9CA3AF]" : "text-[#6b6560]";
  const btn =
    variant === "light"
      ? "border border-[#E6E9EB] bg-[#F8F8F8] text-[#172935] hover:border-[#EC5821]/40 hover:bg-white"
      : "border border-white/12 bg-[#1a1816]/60 text-white hover:border-white/25 hover:bg-[#1a1816]";

  return (
    <>
      <div className="flex items-center gap-3">
        <div className={`h-px flex-1 ${sep}`} />
        <span className={`text-[12px] font-semibold uppercase tracking-wide ${sepText}`}>ou</span>
        <div className={`h-px flex-1 ${sep}`} />
      </div>
      <form action={googleAction}>
        {callbackUrl ? <input type="hidden" name="callbackUrl" value={callbackUrl} /> : null}
        <button
          type="submit"
          className={`flex h-[50px] w-full items-center justify-center gap-2.5 rounded-full text-[15px] font-semibold transition ${btn}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoDev("google.com")} alt="" width={20} height={20} className="shrink-0 rounded-sm" />
          Continuer avec Google
        </button>
      </form>
    </>
  );
}

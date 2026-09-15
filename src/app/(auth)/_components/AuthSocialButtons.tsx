export function AuthSocialButtons({ googleAction }: { googleAction: () => Promise<void> }) {
  return (
    <>
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-[12px] font-semibold uppercase tracking-wide text-[#6b6560]">ou</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>
      <form action={googleAction}>
        <button
          type="submit"
          className="flex h-[50px] w-full items-center justify-center gap-2.5 rounded-full border border-white/12 bg-[#1a1816]/60 text-[15px] font-semibold text-white transition hover:border-white/25 hover:bg-[#1a1816]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/auth/icon-google.svg" alt="" width={18} height={18} className="shrink-0" />
          Continuer avec Google
        </button>
      </form>
    </>
  );
}

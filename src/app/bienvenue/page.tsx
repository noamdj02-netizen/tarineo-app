import Link from "next/link";
import { AuthBrand } from "../(auth)/_components/AuthBrand";

export default function BienvenuePage() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-[#0f0e0d]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/auth/bg-inscription-mobile.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-50"
      />
      <div className="absolute inset-0 bg-[rgba(9,8,7,0.78)]" aria-hidden />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-between px-6 py-10">
        <AuthBrand variant="dark" />
        <div>
          <h1 className="text-[clamp(32px,8vw,44px)] font-extrabold leading-[1.1] text-white">
            Bienvenue sur Tarinéo.
          </h1>
          <p className="mt-4 text-[17px] leading-relaxed text-[#b9b4b0]">
            Importez quelques documents et Tarinéo construit automatiquement votre espace.
          </p>
        </div>
        <div className="flex flex-col gap-3 pb-4">
          <Link
            href="/inscription"
            className="flex h-14 items-center justify-center rounded-full bg-[#f24f0a] text-[16px] font-extrabold text-white"
          >
            Commencer
          </Link>
          <Link
            href="/connexion"
            className="flex h-14 items-center justify-center rounded-full border border-white/20 text-[15px] font-bold text-white"
          >
            J&apos;ai déjà un compte
          </Link>
        </div>
      </div>
    </div>
  );
}

import Image from "next/image";

/** Mascotte 3D « petit bonhomme » — écran bienvenue onboarding (Figma node 196:39409). */
export function MascotteOnboarding() {
  return (
    <div className="relative h-[159px] w-[210px] shrink-0 self-center sm:self-start">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <Image
          src="/onboarding/mascotte.png"
          alt="Mascotte Tarineo — On avance vos projets !"
          width={1536}
          height={1024}
          priority
          className="absolute top-0 left-[-13.36%] h-full w-[113.36%] max-w-none object-contain"
        />
      </div>
    </div>
  );
}

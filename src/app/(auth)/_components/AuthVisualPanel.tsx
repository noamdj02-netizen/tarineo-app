type Variant = "connexion" | "inscription";

const PANELS = {
  connexion: {
    background: "/auth/bg-visual-story-connexion.png",
    kicker: "Matériaux · Sanitaire · Électricité · Outillage",
    title: "Des devis plus justes pour tous les artisans du bâtiment.",
    titleClass: "text-[clamp(28px,2.8vw,52px)]",
    shellPadding: "px-[clamp(24px,4vw,58px)] py-[clamp(28px,4vh,52px)]",
    promiseMaxW: "max-w-[570px]",
    mockup: "/auth/mockup-connexion-cards.png",
    mockupWidth: 644,
    mockupHeight: 282,
    mockupMaxW: 644,
    mockupMaxH: 282,
    mockupMt: "mt-[clamp(24px,4vh,40px)]",
  },
  inscription: {
    background: "/auth/bg-visual-story-inscription.png",
    kicker: "Matériaux · Sanitaire · Électricité · Outillage",
    title: "Vos meilleurs prix commencent par un compte.",
    titleClass: "text-[clamp(26px,2.4vw,40px)]",
    shellPadding: "pl-[clamp(20px,3vw,32px)] pr-[clamp(28px,4vw,58px)] py-[clamp(28px,4vh,52px)]",
    promiseMaxW: "max-w-[632px]",
    mockup: "/auth/mockup-phone.png",
    mockupWidth: 427,
    mockupHeight: 571,
    mockupMaxW: 427,
    mockupMaxH: 571,
    mockupMt: "mt-[clamp(12px,2vh,19px)]",
  },
} as const;

export function AuthVisualPanel({ variant }: { variant: Variant }) {
  const panel = PANELS[variant];

  return (
    <aside
      className="relative hidden h-full min-h-dvh w-[clamp(320px,42vw,760px)] shrink-0 overflow-hidden lg:block"
      aria-hidden
    >
      {/* Fond HD natif — pas de scale, pas de Next/Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={panel.background}
        alt=""
        width={941}
        height={1672}
        className="absolute inset-0 h-full w-full object-cover object-center"
        decoding="async"
      />
      <div className="absolute inset-0 bg-[rgba(9,8,7,0.58)]" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-[#f24f0a]/20 blur-[100px]" />

      <div className={`relative z-10 flex h-full min-h-dvh flex-col ${panel.shellPadding}`}>
        <div className={`flex shrink-0 flex-col gap-5 ${panel.promiseMaxW}`}>
          <p className="text-[13px] font-bold uppercase tracking-[0.04em] text-[#ff6a24]">{panel.kicker}</p>
          <h2 className={`font-extrabold leading-[1.08] text-white ${panel.titleClass}`}>{panel.title}</h2>
          <div className="h-[5px] w-[120px] rounded-full bg-[#f24f0a]" />
        </div>

        <div
          className={`flex min-h-0 flex-1 items-end justify-center ${panel.mockupMt} ${variant === "inscription" ? "pb-0" : "pb-2"}`}
        >
          {/* Mockup à taille native max — jamais agrandi au-delà des pixels Figma */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={panel.mockup}
            alt=""
            width={panel.mockupWidth}
            height={panel.mockupHeight}
            className="block h-auto w-auto object-contain object-bottom drop-shadow-[0_32px_64px_rgba(0,0,0,0.45)]"
            style={{
              maxWidth: `min(${panel.mockupMaxW}px, 100%)`,
              maxHeight: `min(${panel.mockupMaxH}px, calc(100dvh - 240px))`,
            }}
            decoding="async"
          />
        </div>
      </div>
    </aside>
  );
}

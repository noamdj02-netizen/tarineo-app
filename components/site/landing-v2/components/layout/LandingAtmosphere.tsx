/** Fond hero : halos orange + grain (signature visuelle landing). */
export function LandingAtmosphere() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute -top-[20%] left-1/2 h-[min(70vh,520px)] w-[min(120vw,900px)] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at center, color-mix(in srgb, var(--color-accent) 35%, transparent) 0%, transparent 68%)",
        }}
      />
      <div
        className="absolute top-[35%] -right-[15%] h-72 w-72 rounded-full opacity-20 blur-3xl"
        style={{
          background: "radial-gradient(circle, var(--color-accent) 0%, transparent 70%)",
        }}
      />
      <div className="landing-grain absolute inset-0" />
    </div>
  );
}

import { Illustration } from "@/components/illustration";

export default function AppLoading() {
  return (
    <div role="status" className="grid min-h-[60dvh] place-items-center">
      <div className="flex flex-col items-center gap-2">
        <Illustration name="feedback-chargement" className="size-20 animate-pulse" />
        <p className="mono-label">Chargement…</p>
      </div>
    </div>
  );
}

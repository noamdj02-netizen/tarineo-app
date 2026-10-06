import { TarineoLogoMark } from "../../components/TarineoLogoMark";
import { C } from "../constants";

/** Bouton rond de la pill Unlock — logo TARINEO (remplace « + »). */
export function PillLogoBtn({ size = 34 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        display: "grid",
        placeItems: "center",
        background: C.soft,
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      <TarineoLogoMark variant="mark" size={Math.round(size * 0.7)} />
    </div>
  );
}

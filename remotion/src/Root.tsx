import { Composition } from "remotion";
import { TarineoPromo, TARINEO_PROMO_DURATION } from "./TarineoPromo";

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="TarineoPromo"
        component={TarineoPromo}
        durationInFrames={TARINEO_PROMO_DURATION}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
      <Composition
        id="TarineoPromoVertical"
        component={TarineoPromo}
        durationInFrames={TARINEO_PROMO_DURATION}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
    </>
  );
};

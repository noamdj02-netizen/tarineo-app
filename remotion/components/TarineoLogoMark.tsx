import { Img, staticFile } from "remotion";

export function TarineoLogoMark({
  size = 56,
  variant = "light",
}: {
  size?: number;
  variant?: "light" | "dark" | "mark";
}) {
  const src =
    variant === "dark"
      ? "brand/tarineo-logo-dark.png"
      : variant === "mark"
        ? "brand/tarineo-mark.png"
        : "brand/tarineo-logo-light.png";

  return (
    <Img
      src={staticFile(src)}
      style={{
        height: size,
        width: "auto",
        objectFit: "contain",
        display: "block",
      }}
    />
  );
}

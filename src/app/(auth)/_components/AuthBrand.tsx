import { BrandLogo } from "@/components/BrandLogo";

export function AuthBrand({ variant = "dark" }: { variant?: "light" | "dark" }) {
  return (
    <BrandLogo
      href="/"
      wordmarkStyle="auth"
      iconClassName="h-[38px] w-[38px]"
      className={variant === "light" ? "text-black" : "text-white"}
      priority
    />
  );
}

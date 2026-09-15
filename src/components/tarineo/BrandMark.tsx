import Image from "next/image";

const COULEURS: Record<string, string> = {
  Cedeo: "bg-[#EEF1FF] text-[#3B6AE1]",
  "Point P": "bg-[#FFF3E6] text-[#E67A1F]",
  Rexel: "bg-[#E9F8EE] text-[#1F9D55]",
  Sonepar: "bg-[#FDECEC] text-[#D64545]",
  "Leroy Merlin": "bg-[#F3E8FF] text-[#7C3AED]",
  Castorama: "bg-[#E8F1FF] text-[#2563EB]",
  "Brico Dépôt": "bg-[#F3F4F6] text-[#53616A]",
  "Dupont Rénovation": "bg-[#EEF1FF] text-[#3B6AE1]",
};

export function BrandMark({
  nom,
  logo,
  size = 28,
  rounded = "full",
}: {
  nom: string;
  logo?: string | null;
  size?: number;
  rounded?: "full" | "xl";
}) {
  if (logo) {
    return (
      <Image
        src={logo}
        alt=""
        width={size}
        height={size}
        className={rounded === "full" ? "rounded-full object-contain" : "rounded-2xl object-contain"}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className={`inline-flex items-center justify-center font-semibold ${COULEURS[nom] ?? "bg-[#F3F4F6] text-[#53616A]"} ${
        rounded === "full" ? "rounded-full" : "rounded-2xl"
      }`}
      style={{ width: size, height: size, fontSize: size > 36 ? 18 : 13 }}
    >
      {nom.charAt(0)}
    </span>
  );
}

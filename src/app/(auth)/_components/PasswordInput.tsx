"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function PasswordInput({
  id,
  name,
  label,
  required,
  minLength,
  autoComplete,
  variant = "light",
}: {
  id: string;
  name: string;
  label: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
  variant?: "glass" | "solid" | "light";
}) {
  const [visible, setVisible] = useState(false);

  const inputClass =
    variant === "light"
      ? "h-[52px] w-full rounded-[14px] border border-[#E6E9EB] bg-[#F8F8F8] px-4 pr-12 text-[15px] text-[#172935] outline-none transition-colors placeholder:text-[#9CA3AF] focus:border-[#EC5821] focus:bg-white focus:ring-2 focus:ring-[#EC5821]/15"
      : variant === "solid"
        ? "h-[52px] w-full rounded-[14px] border border-[#3a3836] bg-[#1a1816] px-4 pr-12 text-[15px] text-white outline-none placeholder:text-[#6b6560] focus:border-[#EC5821]"
        : "h-[52px] w-full rounded-[14px] border border-white/14 bg-[#1a1816]/90 px-4 pr-12 text-[15px] text-white outline-none placeholder:text-[#6b6560] focus:border-[#EC5821]";

  const labelClass =
    variant === "light" ? "text-[13px] font-semibold text-[#53616A]" : "text-[13px] font-semibold text-[#b9b4b0]";

  const iconClass =
    variant === "light" ? "text-[#9CA3AF] hover:text-[#53616A]" : "text-[#6b6560] hover:text-[#b9b4b0]";

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          placeholder="••••••••"
          className={inputClass}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className={`absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md transition-colors ${iconClass}`}
          aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          aria-pressed={visible}
        >
          {visible ? <Eye className="h-[19px] w-[19px]" strokeWidth={1.75} /> : <EyeOff className="h-[19px] w-[19px]" strokeWidth={1.75} />}
        </button>
      </div>
    </div>
  );
}

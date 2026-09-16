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
  const inputClass =
    variant === "light"
      ? "h-[52px] w-full rounded-[14px] border border-[#E6E9EB] bg-white px-4 pr-12 text-[15px] text-[#172935] outline-none placeholder:text-[#9CA3AF] focus:border-[#EC5821] focus:ring-2 focus:ring-[#EC5821]/20"
      : variant === "solid"
        ? "h-[52px] w-full rounded-[14px] border border-[#3a3836] bg-[#1a1816] px-4 pr-12 text-[15px] text-white outline-none placeholder:text-[#6b6560] focus:border-[#ff6a24]"
        : "h-[52px] w-full rounded-[14px] border border-white/10 bg-[#1a1816]/80 px-4 pr-12 text-[15px] text-white outline-none placeholder:text-[#6b6560] focus:border-[#ff6a24]";

  const labelClass =
    variant === "light" ? "text-[13px] font-semibold text-[#53616A]" : "text-[13px] font-semibold text-[#b9b4b0]";

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type="password"
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          placeholder="••••••••"
          className={inputClass}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/auth/eye-off.svg"
          alt=""
          width={19}
          height={19}
          className={`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 ${variant === "light" ? "opacity-40" : "opacity-50"}`}
          aria-hidden
        />
      </div>
    </div>
  );
}

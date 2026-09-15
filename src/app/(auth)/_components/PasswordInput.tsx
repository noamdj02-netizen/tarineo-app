export function PasswordInput({
  id,
  name,
  label,
  required,
  minLength,
  autoComplete,
  variant = "glass",
}: {
  id: string;
  name: string;
  label: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
  variant?: "glass" | "solid";
}) {
  const inputClass =
    variant === "solid"
      ? "h-[52px] w-full rounded-[14px] border border-[#3a3836] bg-[#1a1816] px-4 pr-12 text-[15px] text-white outline-none placeholder:text-[#6b6560] focus:border-[#ff6a24]"
      : "h-[52px] w-full rounded-[14px] border border-white/10 bg-[#1a1816]/80 px-4 pr-12 text-[15px] text-white outline-none placeholder:text-[#6b6560] focus:border-[#ff6a24]";

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[13px] font-semibold text-[#b9b4b0]">
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
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 opacity-50"
          aria-hidden
        />
      </div>
    </div>
  );
}

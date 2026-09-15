export function AuthField({
  id,
  name,
  label,
  type = "text",
  placeholder,
  required,
  autoComplete,
  variant = "glass",
}: {
  id: string;
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  variant?: "glass" | "solid";
}) {
  const inputClass =
    variant === "solid"
      ? "h-[52px] w-full rounded-[14px] border border-[#3a3836] bg-[#1a1816] px-4 text-[15px] text-white outline-none placeholder:text-[#6b6560] focus:border-[#ff6a24]"
      : "h-[52px] w-full rounded-[14px] border border-white/10 bg-[#1a1816]/80 px-4 text-[15px] text-white outline-none placeholder:text-[#6b6560] focus:border-[#ff6a24]";

  const labelClass = variant === "solid" ? "text-[13px] font-semibold text-[#b9b4b0]" : "text-[13px] font-semibold text-[#b9b4b0]";

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        className={inputClass}
      />
    </div>
  );
}

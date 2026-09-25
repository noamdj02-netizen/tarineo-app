"use client";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { cn } from "cn";

function Switch({
  className,
  size = "default",
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default";
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent bg-[#E5E5EA] transition-[background-color,box-shadow] duration-200 ease-out outline-none",
        "focus-visible:ring-3 focus-visible:ring-primary/30",
        "data-checked:bg-primary data-unchecked:bg-[#E5E5EA]",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        "data-[size=default]:h-[31px] data-[size=default]:w-[51px]",
        "data-[size=sm]:h-[27px] data-[size=sm]:w-[44px]",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.18),0_1px_1px_rgba(0,0,0,0.08)] transition-transform duration-200 ease-out",
          "group-data-[size=default]/switch:size-[27px]",
          "group-data-[size=sm]/switch:size-[23px]",
          "group-data-[size=default]/switch:data-checked:translate-x-[20px]",
          "group-data-[size=default]/switch:data-unchecked:translate-x-[2px]",
          "group-data-[size=sm]/switch:data-checked:translate-x-[17px]",
          "group-data-[size=sm]/switch:data-unchecked:translate-x-[2px]"
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };

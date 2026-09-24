import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

/** POST /auth/signout puis redirection login. */
export function SignOutButton({
  className,
  label = "Se déconnecter",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <form action="/auth/signout" method="post" className="w-full">
      <button
        type="submit"
        className={cn(
          "inline-flex w-full min-h-10 items-center gap-2.5 rounded-xl text-left text-[13px] font-medium transition-colors",
          className,
        )}
      >
        <LogOut className="size-4 shrink-0" aria-hidden />
        <span className="leading-tight tracking-[-0.02em]">{label}</span>
      </button>
    </form>
  );
}

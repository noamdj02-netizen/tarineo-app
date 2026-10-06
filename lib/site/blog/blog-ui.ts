/** Classes partagées — tokens landing-v2 (wrapper `.landing-v2` sur le layout blog). */

export const blogPillBase =
  "inline-flex min-h-11 touch-manipulation items-center rounded-full border px-4 py-2 text-sm font-medium outline-none transition-[background-color,border-color,color,box-shadow] duration-200 focus-visible:ring-2 focus-visible:ring-accent/45";

export const blogPillIdle =
  "border-line bg-paper-0 text-ink-600 hover:border-line-strong hover:bg-paper-50 hover:text-ink-900";

export const blogPillActive = "border-accent bg-accent text-paper-0 shadow-accent";

export const blogCard =
  "group flex flex-col rounded-lg border border-line bg-paper-0 p-5 shadow-card transition-[border-color,box-shadow,transform] duration-200 hover:border-line-strong hover:shadow-float hover:-translate-y-0.5 sm:p-6";

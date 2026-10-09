import { Shield } from "lucide-react";

export function LandingTrustStrip({ items }: { items: string[] }) {
  return (
    <ul className="mt-12 flex flex-col items-center gap-2 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-2">
      {items.map((line) => (
        <li
          key={line}
          className="inline-flex items-center gap-2 rounded-full border border-line bg-paper-0 px-3.5 py-2 text-sm text-ink-600 shadow-[0_1px_2px_rgb(10_10_10/0.03)]"
        >
          <Shield className="size-4 shrink-0 text-accent-700" strokeWidth={1.75} />
          {line}
        </li>
      ))}
    </ul>
  );
}

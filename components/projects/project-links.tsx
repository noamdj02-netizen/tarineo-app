import { Globe, NotebookText } from "lucide-react";
import { FigmaIcon, GithubIcon } from "@/components/icons/brand";
import { safeUrl } from "@/lib/projects/types";
import { cn } from "@/lib/utils";

type Props = { site: string; github: string; figma: string; notion: string; className?: string };

/** Liens Site / GitHub / Figma / Notion. Un lien vide s'affiche en pointillés avec « ? ». */
export function ProjectLinks({ site, github, figma, notion, className }: Props) {
  const links = [
    { icon: Globe, label: "Site", url: site },
    { icon: GithubIcon, label: "GitHub", url: github },
    { icon: FigmaIcon, label: "Figma", url: figma },
    { icon: NotebookText, label: "Notion", url: notion },
  ];
  return (
    <div className={cn("relative z-10 flex flex-wrap gap-1.5", className)}>
      {links.map(({ icon: Icon, label, url }) => {
        const href = safeUrl(url);
        const base =
          "inline-flex min-h-9 items-center gap-1.5 rounded-lg border px-2.5 text-[13px] font-medium";
        return href ? (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              base,
              "border-line bg-surface-2 text-ink transition-colors hover:bg-accent-soft",
            )}
          >
            <Icon className="size-3.5" aria-hidden />
            {label}
          </a>
        ) : (
          <span key={label} className={cn(base, "border-dashed border-ink/15 text-muted-foreground")}>
            <Icon className="size-3.5" aria-hidden />
            {label} ?
          </span>
        );
      })}
    </div>
  );
}

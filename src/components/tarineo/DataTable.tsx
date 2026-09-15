import { MoreHorizontalIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function DataTable({
  columns,
  children,
  footer,
}: {
  columns: string[];
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-[#EEE]">
            {columns.map((c) => (
              <th key={c} className="px-3 py-3 text-[13px] font-normal text-muted-foreground">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
      {footer}
    </div>
  );
}

export function TableRow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <tr className={cn("border-b border-[#F3F3F3] last:border-0", className)}>{children}</tr>;
}

export function TableCell({ children, className, align = "left" }: { children: React.ReactNode; className?: string; align?: "left" | "right" }) {
  return <td className={cn("px-3 py-[14px] text-sm text-[#172935]", align === "right" && "text-right", className)}>{children}</td>;
}

export function RowActions() {
  return (
    <button type="button" className="rounded-lg p-1 text-muted-foreground hover:bg-secondary" aria-label="Actions">
      <MoreHorizontalIcon className="size-4" />
    </button>
  );
}

export function TablePagination({ label = "Affichage de 10 sur 12 résultats" }: { label?: string }) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
      <p>{label}</p>
      <div className="flex items-center gap-1">
        <button type="button" className="size-8 rounded-lg text-muted-foreground hover:bg-secondary">
          ‹
        </button>
        <button type="button" className="size-8 rounded-lg bg-primary text-white">
          1
        </button>
        <button type="button" className="size-8 rounded-lg hover:bg-secondary">
          2
        </button>
        <button type="button" className="size-8 rounded-lg text-muted-foreground hover:bg-secondary">
          ›
        </button>
      </div>
    </div>
  );
}

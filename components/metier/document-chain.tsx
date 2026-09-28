import Link from "next/link";
import { documentAmountHt } from "@/lib/metier/follow-ups";
import { KIND_LABEL, type DocumentCard } from "@/lib/metier/types";
import { euro } from "@/lib/site/tarineo";

export function DocumentChain({ chain }: { chain: DocumentCard[] }) {
  if (chain.length < 2) return null;
  return (
    <ol className="flex flex-col gap-0">
      {chain.map((d, i) => (
        <li key={d.id} className="flex flex-col">
          <Link
            href={`/pieces/${d.id}`}
            className="rounded-[14px] border border-line bg-surface px-3.5 py-3 transition-colors duration-150 hover:bg-surface-2"
          >
            <p className="text-[12px] text-muted-foreground">{KIND_LABEL[d.kind]}</p>
            <p className="font-medium">{d.title}</p>
            <p className="mt-0.5 tabular-nums text-[13px] text-muted-foreground">
              {euro(documentAmountHt(d))} HT
              {d.party_name ? ` · ${d.party_name}` : ""}
            </p>
          </Link>
          {i < chain.length - 1 ? (
            <span className="mx-auto py-1 text-[13px] text-muted-foreground" aria-hidden>
              ↓
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

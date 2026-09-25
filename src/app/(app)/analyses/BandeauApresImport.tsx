"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function BandeauApresImport() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(searchParams.get("import") === "1");
  }, [searchParams]);

  if (!visible) return null;

  function fermer() {
    setVisible(false);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("import");
    const qs = params.toString();
    router.replace(qs ? `/analyses?${qs}` : "/analyses", { scroll: false });
  }

  return (
    <div className="mb-6 flex items-start justify-between gap-3 rounded-2xl border border-[#FFE4D6] bg-[#FFF8F5] px-4 py-3 text-sm text-[#172935]">
      <p>Vos graphiques intègrent vos derniers imports. Les hausses apparaissent au fil de la validation des documents.</p>
      <button
        type="button"
        onClick={fermer}
        className="shrink-0 text-xs font-medium text-primary hover:underline"
      >
        OK
      </button>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createPartyAction } from "@/app/(app)/metier/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AddSupplierForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-dashed border-ink/20 px-4 py-2 text-[13px] hover:bg-surface-2"
      >
        Ajouter un fournisseur
      </button>
    );
  }

  return (
    <form
      className="card-soft flex flex-col gap-2 p-4"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setError(null);
        start(async () => {
          const res = await createPartyAction(fd);
          if (!res.ok) {
            setError(res.error);
            return;
          }
          setOpen(false);
          router.refresh();
        });
      }}
    >
      <p className="text-[14px] font-medium">Nouveau fournisseur</p>
      <Input name="name" required placeholder="Nom (ex. Zima)" className="h-11 rounded-xl" />
      <select name="kind" className="h-11 rounded-xl border border-line bg-surface px-3 text-[14px]">
        <option value="distributeur">Distributeur</option>
        <option value="fournisseur">Marque / fournisseur</option>
      </select>
      <Input name="website" placeholder="Site (zima.fr) — pour le logo" className="h-11 rounded-xl" />
      <Input name="address" placeholder="Adresse" className="h-11 rounded-xl" />
      {error ? <p className="text-[13px] text-destructive">{error}</p> : null}
      <div className="flex gap-2">
        <Button type="submit" disabled={pending} className="rounded-full">
          {pending ? "Enregistrement…" : "Enregistrer"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Annuler
        </Button>
      </div>
    </form>
  );
}

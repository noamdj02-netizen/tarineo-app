"use client";

import Link from "next/link";
import { Mail, MapPin, Phone, User } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/tarineo/status-badge";
import { R } from "@/lib/routes";
import type { ChantierCard, Party } from "@/lib/metier/types";
import { cn } from "@/lib/utils";

export function ChantierClientPanel({
  chantier,
  client,
  devisCount,
  relancesDue,
}: {
  chantier: ChantierCard;
  client: Party | null;
  devisCount: number;
  relancesDue: number;
}) {
  const [open, setOpen] = useState(false);
  const name = client?.name || chantier.client_name || "Client à lier";
  const email = client?.contact_email?.trim() || "";
  const phone = client?.contact_phone?.trim() || "";
  const contactName = client?.contact_name?.trim() || "";
  const address = client?.address?.trim() || chantier.address || "";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button
            type="button"
            className={cn(
              "inline-flex w-full max-w-full items-center gap-2.5 rounded-[12px] border border-line bg-surface px-3 py-2.5 text-left shadow-soft transition-colors",
              "hover:border-line-strong hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nav-orange/35",
              "min-h-11 sm:w-auto",
            )}
          />
        }
      >
        <User className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={1.75} aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="block text-[10.5px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
            Client
          </span>
          <span className="block truncate text-[14px] font-medium">{name}</span>
        </span>
        <StatusBadge
          label={chantier.status === "focus" ? "En cours" : chantier.status === "pause" ? "En pause" : "Terminé"}
          tone={chantier.status === "focus" ? "focus" : chantier.status === "pause" ? "pause" : "fini"}
          className="ml-1 shrink-0"
        />
      </DialogTrigger>
      <DialogContent className="max-w-md gap-0 p-0 sm:max-w-md">
        <DialogHeader className="border-b border-line px-5 pt-5 pb-4">
          <DialogTitle className="font-display text-lg tracking-tight">{name}</DialogTitle>
          <DialogDescription>
            Fiche client du chantier « {chantier.name} »
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 px-5 py-4">
          {contactName ? (
            <p className="text-[14px]">
              <span className="text-muted-foreground">Contact · </span>
              {contactName}
            </p>
          ) : null}
          {address ? (
            <p className="flex gap-2 text-[14px]">
              <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
              <span>{address}</span>
            </p>
          ) : null}
          {phone ? (
            <a href={`tel:${phone.replace(/\s/g, "")}`} className="flex min-h-11 items-center gap-2 text-[14px] font-medium text-tarineo-orange hover:underline">
              <Phone className="size-4 shrink-0" aria-hidden />
              {phone}
            </a>
          ) : null}
          {email ? (
            <a href={`mailto:${email}`} className="flex min-h-11 items-center gap-2 text-[14px] font-medium text-tarineo-orange hover:underline">
              <Mail className="size-4 shrink-0" aria-hidden />
              {email}
            </a>
          ) : null}
          {!phone && !email && !address ? (
            <p className="text-[14px] text-muted-foreground">
              Pas encore de coordonnées. Ajoutez-les sur la fiche client.
            </p>
          ) : null}
          <ul className="grid grid-cols-2 gap-2">
            <li className="rounded-[12px] border border-line bg-surface-2 px-3 py-2.5">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Devis</p>
              <p className="mt-0.5 font-display text-[20px] font-semibold tabular-nums">{devisCount}</p>
            </li>
            <li className="rounded-[12px] border border-line bg-surface-2 px-3 py-2.5">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Relances</p>
              <p className="mt-0.5 font-display text-[20px] font-semibold tabular-nums">{relancesDue}</p>
            </li>
          </ul>
          <Link
            href={`${R.clientDevis}?chantier=${chantier.slug}`}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-tarineo-orange px-4 text-[13.5px] font-medium text-white hover:brightness-[0.96]"
            onClick={() => setOpen(false)}
          >
            Voir ses devis
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}

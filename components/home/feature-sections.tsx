"use client";

import {
  Box,
  Building2,
  CalendarRange,
  Database,
  Droplets,
  FileSpreadsheet,
  FileText,
  Flame,
  Heater,
  Package,
  Plus,
  Target,
  TrendingUp,
  Upload,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { DEMO_MARK, euroInt } from "@/lib/site/tarineo";
import { cn } from "@/lib/utils";

function Bar({ value }: { value: number }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
      <div className="h-full rounded-full bg-brand-orange" style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  );
}

const PRODUCTS = [
  { name: "Chauffe-eau 200L", supplier: "4057090", dist: "5273186", buy: 769, icon: Flame },
  { name: "Pompe à chaleur", supplier: "3310021", dist: "7236402", buy: 1240, icon: Box },
  { name: "Mitigeur douche", supplier: "8236401", dist: "1189037", buy: 89, icon: Droplets },
  { name: "Radiateur 1000W", supplier: "4063003", dist: "7301194", buy: 104, icon: Heater },
] as const;

function Shell({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("gap-0 rounded-[28px] border-line py-0 shadow-soft ring-1 ring-line", className)}>
      <CardHeader className="flex-row items-center gap-3 space-y-0 px-5 pt-5 pb-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#fff0e9] text-brand-orange">
          <Icon className="size-6" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="mono-label text-[10px]">{DEMO_MARK}</p>
          <CardTitle className="font-display text-[18px] font-semibold tracking-tight text-balance sm:text-[20px]">
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5">{children}</CardContent>
    </Card>
  );
}

function RowIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="grid size-11 shrink-0 place-items-center rounded-[12px] bg-surface-2 text-ink">
      <Icon className="size-5" aria-hidden />
    </span>
  );
}

export function FeatProduitsEnregistres() {
  return (
    <Shell title="Produits enregistrés dans votre base Tarinéo" icon={Database}>
      <ul className="flex flex-col">
        {PRODUCTS.map((p, i) => (
          <li key={p.supplier}>
            {i > 0 ? <Separator className="my-2" /> : null}
            <div className="flex items-center gap-3">
              <RowIcon icon={p.icon} />
              <p className="min-w-0 flex-1 text-[15px] font-medium">{p.name}</p>
              <div className="hidden sm:block">
                <p className="text-[11px] text-muted-foreground">Code fournisseur</p>
                <p className="font-medium">{p.supplier}</p>
              </div>
              <div className="hidden md:block">
                <p className="text-[11px] text-muted-foreground">Code distributeur</p>
                <p className="font-medium">{p.dist}</p>
              </div>
              <Button size="icon-sm" variant="secondary" className="rounded-full" aria-label={`Ajouter ${p.name}`}>
                <Plus />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </Shell>
  );
}

export function FeatDevisDistributeur() {
  return (
    <Shell title="Devis distributeur" icon={Package}>
      <ul className="flex flex-col gap-3">
        {PRODUCTS.map((p) => (
          <li key={p.supplier} className="flex items-center gap-3">
            <RowIcon icon={p.icon} />
            <div className="min-w-0 flex-1">
              <p className="font-medium">{p.name}</p>
              <p className="text-[13px] text-muted-foreground">{p.supplier}</p>
            </div>
            <p className="font-medium tabular-nums">{euroInt(p.buy)}</p>
          </li>
        ))}
      </ul>
    </Shell>
  );
}

export function FeatAjouterProduit() {
  return (
    <Shell title="Ajouter un produit à mon devis client" icon={Plus}>
      <Input placeholder="Rechercher un produit enregistré…" className="mb-3 h-11 rounded-xl" />
      <ul className="flex flex-col gap-2">
        {PRODUCTS.map((p) => (
          <li key={p.supplier} className="flex items-center justify-between gap-3 rounded-xl bg-surface-2 px-3 py-2.5">
            <div>
              <p className="font-medium">{p.name}</p>
              <p className="text-[12px] text-muted-foreground">
                Fournisseur : {p.supplier} · Distributeur : {p.dist}
              </p>
            </div>
            <Button size="sm" variant="outline" className="rounded-full">
              Ajouter
            </Button>
          </li>
        ))}
      </ul>
    </Shell>
  );
}

const DISTS = [
  { initials: "BD", name: "Brico Dépôt", invoices: 1245 },
  { initials: "LM", name: "Leroy Merlin", invoices: 982 },
  { initials: "C", name: "Castorama", invoices: 756 },
  { initials: "BC", name: "Brico Cash", invoices: 412 },
];

export function FeatDistributeurs() {
  return (
    <Shell title="Choisissez vos distributeurs" icon={Building2}>
      <p className="mb-3 text-[13px] text-muted-foreground">Tous les distributeurs (12)</p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {DISTS.map((d) => (
          <li key={d.initials} className="flex items-center gap-3 rounded-2xl border border-line px-3 py-2.5">
            <span className="grid size-10 place-items-center rounded-xl bg-[#fff0e9] text-[12px] font-semibold text-brand-orange">
              {d.initials}
            </span>
            <div>
              <p className="font-medium">{d.name}</p>
              <p className="text-[12px] text-muted-foreground">{d.invoices.toLocaleString("fr-FR")} factures</p>
            </div>
          </li>
        ))}
      </ul>
    </Shell>
  );
}

export function FeatProjection() {
  return (
    <Shell title="Projection Brico Dépôt" icon={Target}>
      <div className="flex items-end justify-between gap-4">
        <p className="max-w-[36ch] text-[14.5px] leading-relaxed text-muted-foreground">
          Encore 21 550 € à atteindre. Sur votre rythme actuel, l’objectif est atteignable à 92 %.
        </p>
        <p className="font-display text-[36px] font-semibold tabular-nums text-brand-orange">92 %</p>
      </div>
      <div className="mt-4">
        <Bar value={92} />
      </div>
    </Shell>
  );
}

export function FeatPeriode() {
  return (
    <Shell title="Sélectionnez la période" icon={CalendarRange}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 text-[13px] font-medium">Date de début</p>
          <Input defaultValue="01/01/2026" className="h-11 rounded-xl" />
        </div>
        <div>
          <p className="mb-1.5 text-[13px] font-medium">Date de fin</p>
          <Input defaultValue="30/09/2026" className="h-11 rounded-xl" />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {["Ce mois", "Trimestre", "Cette année", "Année dernière"].map((l) => (
          <Button key={l} size="sm" variant={l === "Cette année" ? "default" : "outline"} className="rounded-full">
            {l}
          </Button>
        ))}
      </div>
    </Shell>
  );
}

export function FeatEncours() {
  const rows = [
    { name: "Chauffe-eau", pct: 44, amount: 12450 },
    { name: "Pompe à chaleur", pct: 29, amount: 8200 },
    { name: "Climatisation", pct: 17, amount: 4800 },
  ];
  return (
    <Shell title="Répartition de l’encours" icon={TrendingUp}>
      <p className="mb-3 font-display text-[28px] font-semibold tabular-nums">
        {euroInt(28450)} <span className="text-[14px] font-normal text-muted-foreground">encours</span>
      </p>
      <ul className="flex flex-col gap-2.5">
        {rows.map((r) => (
          <li key={r.name}>
            <div className="mb-1 flex justify-between text-[13px]">
              <span>{r.name}</span>
              <span className="tabular-nums text-muted-foreground">
                {r.pct} % · {euroInt(r.amount)}
              </span>
            </div>
            <Bar value={r.pct} />
          </li>
        ))}
      </ul>
    </Shell>
  );
}

export function FeatFicheProduit() {
  return (
    <Shell title="Chauffe-eau 200L" icon={Flame}>
      <p className="text-[13px] text-muted-foreground">
        Code fournisseur : 4057090 · Code distributeur : 5273186
      </p>
      <Button className="mt-3 rounded-full">Ajouter au devis</Button>
      <Separator className="my-4" />
      <div className="grid grid-cols-3 gap-2 text-[13px]">
        <p className="text-muted-foreground">Date</p>
        <p className="text-muted-foreground">Distributeur</p>
        <p className="text-muted-foreground">Variation</p>
        <p>12/09/2026</p>
        <p>Brico Dépôt</p>
        <p className="text-brand-orange">+ 4,3 %</p>
      </div>
    </Shell>
  );
}

export function FeatDepot() {
  return (
    <Shell title="Glissez vos documents ici" icon={Upload}>
      <div className="rounded-[22px] border border-dashed border-line bg-surface-2 px-4 py-10 text-center">
        <p className="text-[14.5px] text-muted-foreground">PDF, JPEG, PNG ou HEIC — cliquez pour parcourir</p>
      </div>
    </Shell>
  );
}

const HAUSSES = [
  { name: "Chauffe-eau 200L", pct: 12 },
  { name: "Pompe à chaleur", pct: 9 },
  { name: "Mitigeur douche", pct: 8 },
  { name: "Tube cuivre", pct: 6 },
  { name: "Radiateur 1000W", pct: 5 },
];

export function FeatTopHausses() {
  return (
    <Shell title="Produits avec la plus forte hausse" icon={TrendingUp}>
      <ul className="flex flex-col gap-2">
        {HAUSSES.map((h) => (
          <li key={h.name} className="flex items-center justify-between gap-3">
            <span>{h.name}</span>
            <Badge variant="secondary" className="tabular-nums text-brand-orange">
              + {h.pct} %
            </Badge>
          </li>
        ))}
      </ul>
    </Shell>
  );
}

export function FeatEvolutionPrix() {
  const bars = [8, 12, 10, 16, 20, 22, 25];
  return (
    <Shell title="Évolution des prix distributeurs" icon={TrendingUp}>
      <p className="mb-3 font-display text-[28px] font-semibold">
        + 24,8 % <span className="text-[14px] font-normal text-muted-foreground">en 6 mois</span>
      </p>
      <div className="flex h-24 items-end gap-1.5">
        {bars.map((b, i) => (
          <div key={i} className="flex-1 rounded-md bg-brand-orange/20">
            <div className="w-full rounded-md bg-brand-orange" style={{ height: `${b * 4}%` }} />
          </div>
        ))}
      </div>
    </Shell>
  );
}

export function FeatDetailFamille() {
  const rows = [
    { name: "Chauffe-eau", ventes: 12450, obj: 20000, pct: 62 },
    { name: "Pompe à chaleur", ventes: 8200, obj: 15000, pct: 55 },
    { name: "Climatisation", ventes: 4800, obj: 8000, pct: 60 },
  ];
  return (
    <Shell title="Détail par famille de produits" icon={FileSpreadsheet}>
      <ul className="flex flex-col gap-3">
        {rows.map((r) => (
          <li key={r.name}>
            <div className="mb-1 flex justify-between text-[13px]">
              <span className="font-medium">{r.name}</span>
              <span className="tabular-nums text-muted-foreground">
                {euroInt(r.ventes)} / {euroInt(r.obj)} · {r.pct} %
              </span>
            </div>
            <Bar value={r.pct} />
          </li>
        ))}
      </ul>
    </Shell>
  );
}

export function FeatTypeFactures() {
  return (
    <Shell title="Type de factures à exporter" icon={FileText}>
      <div className="flex flex-col gap-2">
        <Button variant="outline" className="h-11 justify-start rounded-xl">
          Factures distributeur (achats)
        </Button>
        <Button variant="outline" className="h-11 justify-start rounded-xl">
          Factures client (ventes)
        </Button>
      </div>
      <p className="mt-3 text-[13px] text-muted-foreground">Un seul type, ou les deux en même temps.</p>
    </Shell>
  );
}

export function FeatCarteProduit() {
  const rows = [
    { d: "Janvier 2026", p: 769, v: "—" },
    { d: "Mars 2026", p: 802, v: "+ 4,3 %" },
    { d: "Juin 2026", p: 834, v: "+ 4,0 %" },
  ];
  return (
    <Shell title="Chauffe-eau 200L · réf. 4057090" icon={Flame}>
      <ul className="flex flex-col gap-2 text-[14px]">
        {rows.map((r) => (
          <li key={r.d} className="flex justify-between gap-3">
            <span className="text-muted-foreground">{r.d}</span>
            <span className="tabular-nums">{euroInt(r.p)}</span>
            <span className="tabular-nums text-brand-orange">{r.v}</span>
          </li>
        ))}
      </ul>
    </Shell>
  );
}

export function FeatApercuExport() {
  return (
    <Shell title="Aperçu des données à exporter" icon={FileSpreadsheet}>
      <div className="overflow-x-auto text-[13px]">
        <div className="grid min-w-[28rem] grid-cols-4 gap-2 font-medium text-muted-foreground">
          <span>Date</span>
          <span>Type</span>
          <span>N°</span>
          <span>HT</span>
        </div>
        <Separator className="my-2" />
        <div className="grid min-w-[28rem] grid-cols-4 gap-2">
          <span>12/01/2026</span>
          <span>Achat</span>
          <span>BRD-45872</span>
          <span className="tabular-nums">769,00 €</span>
        </div>
      </div>
    </Shell>
  );
}

export function FeatEvolutionPrixAchat() {
  const bars = [70, 72, 74, 78, 80, 82, 84, 86, 88];
  return (
    <Shell title="Évolution du prix d’achat" icon={TrendingUp}>
      <div className="flex h-20 items-end gap-1">
        {bars.map((b, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm bg-brand-orange/80"
            style={{ height: `${b}%` }}
          />
        ))}
      </div>
      <p className="mt-2 text-right text-[15px] font-medium tabular-nums">{euroInt(861)}</p>
    </Shell>
  );
}

export function FeatObjectifs() {
  const rows = [
    { name: "Brico Dépôt", now: 28450, obj: 50000, pct: 57 },
    { name: "Leroy Merlin", now: 42180, obj: 60000, pct: 70 },
    { name: "Castorama", now: 18900, obj: 40000, pct: 47 },
  ];
  return (
    <Shell title="Vos objectifs annuels · 2026" icon={Target}>
      <ul className="flex flex-col gap-3">
        {rows.map((r) => (
          <li key={r.name}>
            <div className="mb-1 flex justify-between text-[13px]">
              <span className="font-medium">{r.name}</span>
              <span className="tabular-nums text-muted-foreground">
                {euroInt(r.now)} / {euroInt(r.obj)}
              </span>
            </div>
            <Bar value={r.pct} />
          </li>
        ))}
      </ul>
    </Shell>
  );
}

export function FeatActions() {
  const items = [
    { t: "Augmenter les ventes en climatisation", d: "Écart de 3 200 € par rapport à l’objectif." },
    { t: "Profiter des promotions en cours", d: "2 offres chez Brico Dépôt." },
    { t: "Focus sur les produits à forte marge", d: "Pompes à chaleur : + 18 % de marge moyenne." },
  ];
  return (
    <Shell title="Actions recommandées" icon={Target}>
      <ul className="flex flex-col gap-3">
        {items.map((it) => (
          <li key={it.t}>
            <p className="font-medium">{it.t}</p>
            <p className="text-[13px] text-muted-foreground">{it.d}</p>
          </li>
        ))}
      </ul>
    </Shell>
  );
}

export function FeatMesDevis() {
  const stats = [
    { n: 18, l: "envoyés", d: "+8 %" },
    { n: 7, l: "à relancer", d: "−3 %" },
    { n: 12, l: "acceptés", d: "+20 %" },
    { n: 4, l: "refusés", d: "−2 %" },
  ];
  return (
    <Shell title="Mes devis clients" icon={FileText}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.l} className="rounded-2xl bg-surface-2 px-3 py-3">
            <p className="font-display text-[26px] font-semibold tabular-nums">{s.n}</p>
            <p className="text-[12px] text-muted-foreground">{s.l}</p>
            <p className="text-[12px] text-brand-orange">{s.d}</p>
          </div>
        ))}
      </div>
    </Shell>
  );
}

export function FeatFormatExport() {
  return (
    <Shell title="Format d’export" icon={FileSpreadsheet}>
      <div className="flex flex-col gap-2">
        <Button variant="outline" className="h-11 justify-start rounded-xl">
          Excel (.xlsx)
        </Button>
        <Button variant="outline" className="h-11 justify-start rounded-xl">
          CSV (.csv)
        </Button>
      </div>
      <Button className="mt-4 w-full rounded-full">Générer l’export comptable</Button>
    </Shell>
  );
}

export function FeatTopVendus() {
  const rows = [
    { n: 1, name: "Chauffe-eau 200L", s: "8 ventes", a: 5920 },
    { n: 2, name: "Pompe à chaleur", s: "5 ventes", a: 4250 },
    { n: 3, name: "Mitigeur douche", s: "4 ventes", a: 1980 },
  ];
  return (
    <Shell title="Top produits vendus" icon={Package}>
      <ol className="flex flex-col gap-2">
        {rows.map((r) => (
          <li key={r.n} className="flex items-center gap-3">
            <span className="w-5 font-mono text-[12px] text-muted-foreground">{r.n}</span>
            <span className="flex-1">{r.name}</span>
            <span className="text-[12px] text-muted-foreground">{r.s}</span>
            <span className="tabular-nums font-medium">{euroInt(r.a)}</span>
          </li>
        ))}
      </ol>
    </Shell>
  );
}

export function FeatChiffreAffaires() {
  const bars = [40, 48, 52, 70, 78, 88];
  return (
    <Shell title="Chiffre d’affaires · 6 derniers mois" icon={TrendingUp}>
      <p className="font-display text-[28px] font-semibold tabular-nums">
        {euroInt(12480)}{" "}
        <span className="text-[14px] font-normal text-brand-orange">+ 24 %</span>
      </p>
      <div className="mt-3 flex h-24 items-end gap-2">
        {bars.map((b, i) => (
          <div key={i} className="flex-1 rounded-md bg-brand-orange" style={{ height: `${b}%` }} />
        ))}
      </div>
    </Shell>
  );
}

export function FeatPrincipalesHausses() {
  const rows = [
    { name: "Chauffe-eau 200L", ref: "4057090", pct: "24,8 %" },
    { name: "Pompe à chaleur", ref: "1123401", pct: "18,2 %" },
    { name: "Mitigeur douche", ref: "7654321", pct: "12,6 %" },
  ];
  return (
    <Shell title="Principales hausses détectées" icon={TrendingUp}>
      <ul className="flex flex-col gap-3">
        {rows.map((r) => (
          <li key={r.ref} className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium">{r.name}</p>
              <p className="text-[12px] text-muted-foreground">Réf. {r.ref}</p>
            </div>
            <span className="font-semibold tabular-nums text-brand-orange">+ {r.pct}</span>
          </li>
        ))}
      </ul>
    </Shell>
  );
}

export function FeatBricoDepot() {
  return (
    <Shell title="Brico Dépôt · BFA 2026" icon={Building2}>
      <div className="grid grid-cols-3 gap-3 text-[13px]">
        <div>
          <p className="text-muted-foreground">Objectif</p>
          <p className="font-semibold tabular-nums">{euroInt(50000)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Encours</p>
          <p className="font-semibold tabular-nums">{euroInt(28450)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Reste</p>
          <p className="font-semibold tabular-nums">{euroInt(21550)}</p>
        </div>
      </div>
      <div className="mt-3">
        <Bar value={57} />
      </div>
      <p className="mt-2 text-[12px] text-brand-orange">+ 12 % vs même période 2025</p>
    </Shell>
  );
}

export function FeatEvolutionVentes() {
  const bars = [45, 50, 48, 62, 70];
  return (
    <Shell title="Évolution des ventes" icon={TrendingUp}>
      <div className="flex h-24 items-end gap-2">
        {bars.map((b, i) => (
          <div key={i} className="flex-1 rounded-md bg-brand-orange/80" style={{ height: `${b}%` }} />
        ))}
      </div>
    </Shell>
  );
}

export function FeatStatutDevis() {
  const rows = [
    { l: "Envoyés", n: 18, pct: 44 },
    { l: "À relancer", n: 7, pct: 17 },
    { l: "Acceptés", n: 12, pct: 29 },
    { l: "Refusés", n: 4, pct: 10 },
  ];
  return (
    <Shell title="Statut de vos devis" icon={FileText}>
      <p className="mb-3 font-display text-[32px] font-semibold tabular-nums">
        41 <span className="text-[14px] font-normal text-muted-foreground">devis clients</span>
      </p>
      <ul className="grid grid-cols-2 gap-2">
        {rows.map((r) => (
          <li key={r.l} className="rounded-xl bg-surface-2 px-3 py-2">
            <p className="text-[12px] text-muted-foreground">{r.l}</p>
            <p className="font-semibold tabular-nums">
              {r.n} <span className="font-normal text-muted-foreground">{r.pct} %</span>
            </p>
          </li>
        ))}
      </ul>
    </Shell>
  );
}

export const FEATURE_SECTIONS = [
  { id: "hausses", title: "Principales hausses", node: "501:555", Comp: FeatPrincipalesHausses },
  { id: "produits", title: "Produits enregistrés", node: "501:77", Comp: FeatProduitsEnregistres },
  { id: "devis-dist", title: "Devis distributeur", node: "501:38", Comp: FeatDevisDistributeur },
  { id: "actions", title: "Actions recommandées", node: "501:954", Comp: FeatActions },
  { id: "projection", title: "Projection", node: "501:872", Comp: FeatProjection },
  { id: "top-hausses", title: "Top hausses", node: "501:993", Comp: FeatTopHausses },
  { id: "ajouter", title: "Ajouter un produit", node: "502:369", Comp: FeatAjouterProduit },
  { id: "distributeurs", title: "Distributeurs", node: "501:266", Comp: FeatDistributeurs },
  { id: "periode", title: "Période", node: "501:231", Comp: FeatPeriode },
  { id: "encours", title: "Encours", node: "501:885", Comp: FeatEncours },
  { id: "fiche", title: "Fiche produit", node: "501:175", Comp: FeatFicheProduit },
  { id: "depot", title: "Dépôt documents", node: "501:1106", Comp: FeatDepot },
  { id: "evo-prix", title: "Évolution des prix", node: "501:512", Comp: FeatEvolutionPrix },
  { id: "famille", title: "Détail par famille", node: "501:826", Comp: FeatDetailFamille },
  { id: "factures", title: "Type de factures", node: "501:323", Comp: FeatTypeFactures },
  { id: "carte", title: "Carte produit", node: "501:1052", Comp: FeatCarteProduit },
  { id: "apercu", title: "Aperçu export", node: "501:349", Comp: FeatApercuExport },
  { id: "evo-achat", title: "Prix d’achat", node: "501:142", Comp: FeatEvolutionPrixAchat },
  { id: "objectifs", title: "Objectifs annuels", node: "501:667", Comp: FeatObjectifs },
  { id: "devis", title: "Mes devis clients", node: "501:598", Comp: FeatMesDevis },
  { id: "format", title: "Format export", node: "501:420", Comp: FeatFormatExport },
  { id: "top-vendus", title: "Top vendus", node: "501:476", Comp: FeatTopVendus },
  { id: "ca", title: "Chiffre d’affaires", node: "501:446", Comp: FeatChiffreAffaires },
  { id: "brico", title: "Brico Dépôt", node: "501:738", Comp: FeatBricoDepot },
  { id: "ventes", title: "Évolution des ventes", node: "501:770", Comp: FeatEvolutionVentes },
  { id: "statut", title: "Statut devis", node: "501:641", Comp: FeatStatutDevis },
] as const;

const PRIMARY = ["hausses", "produits", "devis-dist", "actions", "projection"] as const;

export function FeatureSectionGrid({
  ids,
  className,
}: {
  ids: readonly string[];
  className?: string;
}) {
  const items = FEATURE_SECTIONS.filter((s) => ids.includes(s.id));
  return (
    <div className={cn("grid gap-3 xl:grid-cols-2", className)}>
      {items.map(({ id, Comp }) => (
        <Comp key={id} />
      ))}
    </div>
  );
}

/** Bloc dashboard : 5 cartes utiles + le reste en grille. */
export function FeatureMetierBoard() {
  const primary = FEATURE_SECTIONS.filter((s) => (PRIMARY as readonly string[]).includes(s.id));
  const rest = FEATURE_SECTIONS.filter((s) => !(PRIMARY as readonly string[]).includes(s.id));
  return (
    <section className="flex flex-col gap-3" aria-label="Sections métier">
      <p className="mono-label">{"/ Sections métier ///"}</p>
      <div className="grid gap-3 xl:grid-cols-2">
        {primary.map(({ id, Comp }) => (
          <Comp key={id} />
        ))}
      </div>
      <details className="group rounded-[28px] border border-line bg-card px-4 py-3 ring-1 ring-line">
        <summary className="cursor-pointer list-none font-medium text-[14.5px]">
          Les 21 autres cartes
          <span className="ml-2 text-muted-foreground group-open:hidden"> (ouvrir)</span>
        </summary>
        <div className="mt-3 grid gap-3 xl:grid-cols-2">
          {rest.map(({ id, Comp }) => (
            <Comp key={id} />
          ))}
        </div>
      </details>
    </section>
  );
}

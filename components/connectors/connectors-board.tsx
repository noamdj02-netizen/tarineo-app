"use client";

import {
  Briefcase,
  Check,
  Code,
  Copy,
  KeyRound,
  Lightbulb,
  Loader2,
  Megaphone,
  PenTool,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { Reveal, RevealGroup } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BRAND } from "@/lib/brand";
import {
  activateTool,
  bindCalendarFeed,
  bindGmail,
  bindOfficialUrl,
  bindStripeKey,
  deactivateTool,
  provisionMcpKey,
} from "@/lib/connectors/actions";
import {
  connectorGroups,
  MCP_TOOL_IDS,
  type ConnectorBind,
  type ConnectorSignals,
  type ConnectorTool,
} from "@/lib/connectors/catalog";
import { TOOL_LOGOS } from "@/lib/design-data/tools";
import { cn } from "@/lib/utils";

const GROUP_ICONS: Record<string, LucideIcon> = {
  lightbulb: Lightbulb,
  "pen-tool": PenTool,
  code: Code,
  briefcase: Briefcase,
  megaphone: Megaphone,
};

const LOCAL = "navpit.tool-binds";

function readLocal(): Record<string, ConnectorBind> {
  try {
    const raw = localStorage.getItem(LOCAL);
    return raw ? (JSON.parse(raw) as Record<string, ConnectorBind>) : {};
  } catch {
    return {};
  }
}

function writeLocal(map: Record<string, ConnectorBind>) {
  try {
    localStorage.setItem(LOCAL, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function ConnectorsBoard({
  initial,
  compact = false,
}: {
  initial: ConnectorSignals;
  compact?: boolean;
}) {
  const groups = useMemo(() => connectorGroups(), []);
  const [origin, setOrigin] = useState<string>(BRAND.siteUrl);
  const [connections, setConnections] = useState(initial.connections);
  const [picked, setPicked] = useState<ConnectorTool | null>(null);
  const [bind, setBind] = useState("");
  const [mcpKey, setMcpKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, start] = useTransition();

  useEffect(() => {
    setOrigin(window.location.origin);
    setConnections((cur) => ({ ...readLocal(), ...cur }));
  }, []);

  const connected = useCallback(
    (id: string) =>
      Boolean(connections[id]) ||
      initial.calendarIds.includes(id) ||
      (MCP_TOOL_IDS.has(id) && initial.mcpUsed),
    [connections, initial.calendarIds, initial.mcpUsed],
  );

  function markLocal(id: string, on: boolean, label = "") {
    setConnections((cur) => {
      const next = { ...cur };
      if (on) next[id] = { at: new Date().toISOString(), label };
      else delete next[id];
      writeLocal(next);
      return next;
    });
  }

  function openTool(tool: ConnectorTool) {
    setPicked(tool);
    setBind("");
    setMcpKey(null);
    setError(null);
  }

  function activate(tool: ConnectorTool) {
    setError(null);
    start(async () => {
      if (tool.meta.kind === "url") {
        if (!bind.trim()) {
          setError(`Colle ${tool.meta.bindLabel.toLowerCase()} pour lier les deux apps.`);
          return;
        }
        const res = await bindOfficialUrl(tool.id, bind, tool.meta.linkField);
        if (!res.ok) {
          setError(res.error);
          return;
        }
        markLocal(tool.id, true, bind.trim());
        return;
      }

      if (tool.meta.kind === "secret") {
        const res = await bindStripeKey(bind);
        if (!res.ok) {
          setError(res.error);
          return;
        }
        markLocal(tool.id, true, res.label);
        setBind("");
        return;
      }

      if (tool.meta.kind === "oauth") {
        if (tool.meta.oauth === "google" && !bind.trim()) {
          window.location.href = tool.meta.connectUrl;
          return;
        }
        if (tool.id === "gmail") {
          const res = await bindGmail(bind || initial.googleEmail || "");
          if (!res.ok) {
            setError(res.error);
            return;
          }
          markLocal(tool.id, true, bind || initial.googleEmail || "");
          return;
        }
        if (tool.id === "google-drive") {
          if (!bind.trim()) {
            window.location.href = tool.meta.connectUrl;
            return;
          }
          const res = await bindOfficialUrl(tool.id, bind);
          if (!res.ok) {
            setError(res.error);
            return;
          }
          markLocal(tool.id, true, bind.trim());
          return;
        }
      }

      if (tool.meta.kind === "feed") {
        if (!bind.trim()) {
          setError("Colle le flux iCal officiel.");
          return;
        }
        const res = await bindCalendarFeed(bind);
        if (!res.ok) {
          setError(res.error);
          return;
        }
        markLocal(tool.id, true, "Calendrier");
        return;
      }

      if (tool.meta.kind === "mcp") {
        const res = await provisionMcpKey(tool.name);
        if (!res.ok) {
          setError(res.error);
          return;
        }
        markLocal(tool.id, true, res.prefix);
        if (res.key) setMcpKey(res.key);
        return;
      }

      const res = await activateTool(tool.id);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      markLocal(tool.id, true, "Navpit");
    });
  }

  function disconnect(tool: ConnectorTool) {
    setError(null);
    start(async () => {
      const res = await deactivateTool(tool.id);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      markLocal(tool.id, false);
      setPicked(null);
    });
  }

  const mcpUrl = `${origin}/api/mcp`;
  const claudeCmd = (key: string) =>
    `claude mcp add --transport http navpit ${mcpUrl} --header "Authorization: Bearer ${key}"`;
  const cursorJson = (key: string) => `{
  "mcpServers": {
    "navpit": {
      "url": "${mcpUrl}",
      "headers": { "Authorization": "Bearer ${key}" }
    }
  }
}`;

  return (
    <>
      <div className={cn("flex flex-col", compact ? "gap-5" : "gap-7")}>
        {groups.map((group, gi) => {
          const ok = group.tools.filter((t) => connected(t.id)).length;
          const Icon = GROUP_ICONS[group.icon];
          return (
            <RevealGroup key={group.id} stagger={0.035} className="flex flex-col gap-3">
              <Reveal>
                <h2 className="flex items-center gap-2 text-[18px] font-semibold tracking-[-0.02em]">
                  <span className="grid size-8 place-items-center rounded-lg bg-accent-soft">
                    {Icon ? <Icon className="size-4" aria-hidden /> : null}
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                    {String(gi + 1).padStart(2, "0")}
                  </span>
                  {group.label}
                  <span className="ml-auto font-mono text-[11px] text-muted-foreground tabular-nums">
                    {ok}/{group.tools.length}
                  </span>
                </h2>
              </Reveal>
              <div
                className={cn(
                  "grid gap-2.5",
                  compact
                    ? "sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))]"
                    : "sm:grid-cols-[repeat(auto-fill,minmax(240px,1fr))]",
                )}
              >
                {group.tools.map((tool) => {
                  const logo = TOOL_LOGOS[tool.name];
                  const okTool = connected(tool.id);
                  const label = connections[tool.id]?.label;
                  return (
                    <Reveal key={tool.id}>
                      <button
                        type="button"
                        onClick={() => openTool(tool)}
                        className="card-soft group flex h-full w-full items-center gap-3 p-3 text-left transition-[transform,box-shadow] duration-300 ease-out-soft hover:-translate-y-0.5 hover:shadow-lift"
                      >
                        <span className="grid size-11 flex-none place-items-center overflow-hidden rounded-xl bg-white shadow-soft">
                          {logo ? (
                            // eslint-disable-next-line @next/next/no-img-element -- logos data URI
                            <img
                              src={logo}
                              alt=""
                              width={24}
                              height={24}
                              className="size-6 object-contain"
                            />
                          ) : (
                            <span className="btn-dark grid size-11 place-items-center rounded-xl text-[15px] font-bold">
                              {tool.name.charAt(0)}
                            </span>
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <b className="block truncate text-[15px] font-semibold">{tool.name}</b>
                          <small className="block truncate text-[13px] leading-snug text-muted-foreground">
                            {okTool && label ? label : tool.desc}
                          </small>
                        </span>
                        {okTool ? (
                          <span className="self-start rounded-md bg-st-focus-soft px-1.5 py-0.5 font-mono text-[10px] whitespace-nowrap text-st-focus-ink">
                            Connecté
                          </span>
                        ) : (
                          <span className="self-start rounded-md bg-ink px-1.5 py-0.5 font-mono text-[10px] whitespace-nowrap text-accent-ink">
                            Connecter
                          </span>
                        )}
                      </button>
                    </Reveal>
                  );
                })}
              </div>
            </RevealGroup>
          );
        })}
      </div>

      <Dialog open={Boolean(picked)} onOpenChange={(open) => !open && setPicked(null)}>
        <DialogContent className="sm:max-w-md" showCloseButton>
          {picked ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center overflow-hidden rounded-xl bg-white shadow-soft">
                    {TOOL_LOGOS[picked.name] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={TOOL_LOGOS[picked.name]} alt="" className="size-6 object-contain" />
                    ) : null}
                  </span>
                  {connected(picked.id)
                    ? `${picked.name} est connecté`
                    : `Connecter ${picked.name}`}
                </DialogTitle>
                <DialogDescription>{picked.meta.hint}</DialogDescription>
              </DialogHeader>

              {picked.id === "stripe" && initial.stripeBilling ? (
                <p className="rounded-lg bg-st-focus-soft px-3 py-2 text-[13px] text-st-focus-ink">
                  Tu paies déjà Navpit via Stripe. Ajoute une clé restreinte pour lier
                  le Stripe de ton produit.
                </p>
              ) : null}

              {needsBindField(picked) && !connected(picked.id) ? (
                <label className="block">
                  <span className="mono-label">{picked.meta.bindLabel}</span>
                  <input
                    value={bind}
                    onChange={(e) => setBind(e.target.value)}
                    placeholder={
                      picked.id === "gmail" && initial.googleEmail
                        ? initial.googleEmail
                        : picked.meta.bindPlaceholder
                    }
                    type={picked.meta.kind === "secret" ? "password" : "text"}
                    autoComplete="off"
                    className="mt-1.5 min-h-11 w-full rounded-xl border border-line bg-surface-2 px-3 text-[14px] outline-none focus:border-ink/30"
                  />
                </label>
              ) : null}

              {picked.meta.kind === "mcp" && (mcpKey || connected(picked.id)) ? (
                <div className="flex flex-col gap-2">
                  {mcpKey ? (
                    <p className="text-[13px] text-ink/80">
                      Clé créée. Copie-la une fois, puis continue dans Navpit.
                    </p>
                  ) : (
                    <p className="flex items-center gap-2 text-[13px] text-muted-foreground">
                      <KeyRound className="size-3.5" aria-hidden />
                      Clé déjà dans Compte. Colle le snippet dans {picked.name}.
                    </p>
                  )}
                  <code className="overflow-x-auto rounded-lg bg-surface-2 px-3 py-2 font-mono text-[11px]">
                    {picked.name === "Cursor"
                      ? cursorJson(mcpKey || "TA_CLE")
                      : claudeCmd(mcpKey || "TA_CLE")}
                  </code>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      void navigator.clipboard.writeText(
                        picked.name === "Cursor"
                          ? cursorJson(mcpKey || "TA_CLE")
                          : claudeCmd(mcpKey || "TA_CLE"),
                      );
                      setCopied(true);
                      window.setTimeout(() => setCopied(false), 1500);
                    }}
                  >
                    <Copy data-icon="inline-start" />
                    {copied ? "Copié" : "Copier le snippet"}
                  </Button>
                </div>
              ) : null}

              {error ? (
                <p role="alert" className="text-[13px] text-destructive">
                  {error}
                </p>
              ) : null}

              <DialogFooter>
                {connected(picked.id) ? (
                  <>
                    <Button type="button" variant="ghost" disabled={pending} onClick={() => disconnect(picked)}>
                      Retirer
                    </Button>
                    <Link
                      href={picked.meta.stayHref}
                      className="btn-dark inline-flex min-h-8 items-center rounded-lg px-3 text-[13.5px] font-medium"
                    >
                      {picked.meta.stayLabel}
                    </Link>
                  </>
                ) : (
                  <>
                    {picked.meta.kind === "oauth" && picked.meta.oauth === "google" ? (
                      <a
                        href={picked.meta.connectUrl}
                        className="inline-flex min-h-8 items-center rounded-lg border border-line px-3 text-[13.5px] font-medium"
                      >
                        Continuer avec Google
                      </a>
                    ) : null}
                    <Button type="button" disabled={pending} onClick={() => activate(picked)}>
                      {pending ? (
                        <Loader2 data-icon="inline-start" className="animate-spin" />
                      ) : (
                        <Check data-icon="inline-start" />
                      )}
                      {picked.meta.kind === "oauth" && !bind.trim() && picked.id !== "gmail"
                        ? "Continuer"
                        : "Lier à Navpit"}
                    </Button>
                  </>
                )}
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

function needsBindField(tool: ConnectorTool) {
  return (
    tool.meta.kind === "url" ||
    tool.meta.kind === "secret" ||
    tool.meta.kind === "feed" ||
    tool.meta.kind === "oauth"
  );
}

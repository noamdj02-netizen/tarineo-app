"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

type ApiKey = {
  id: string;
  name: string;
  prefix: string;
  scopes: ("read" | "write")[];
  lastUsedAt: string | null;
  createdAt: string;
};

const PENDING_KEY = "navpit.mcp.pending-key";

function readPendingKey() {
  try {
    return sessionStorage.getItem(PENDING_KEY);
  } catch {
    return null;
  }
}

function writePendingKey(key: string | null) {
  try {
    if (key) sessionStorage.setItem(PENDING_KEY, key);
    else sessionStorage.removeItem(PENDING_KEY);
  } catch {
    /* ignore quota / private mode */
  }
}

function formatDate(iso: string | null) {
  if (!iso) return "Jamais utilisée";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ApiKeysCard() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [name, setName] = useState("");
  const [canWrite, setCanWrite] = useState(true);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [armed, setArmed] = useState<string | null>(null);

  const [origin, setOrigin] = useState<string>(BRAND.siteUrl);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const mcpUrl = `${origin}/api/mcp`;

  const load = useCallback(async () => {
    const res = await fetch("/api/account/api-keys");
    if (res.ok) setKeys(await res.json());
  }, []);

  useEffect(() => {
    const pending = readPendingKey();
    if (pending) setNewKey(pending);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function createKey() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/account/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        scopes: canWrite ? ["read", "write"] : ["read"],
      }),
    });
    const body = await res.json();
    setBusy(false);
    if (!res.ok) return setError(body.error ?? "Impossible de créer la clé.");
    setNewKey(body.key);
    writePendingKey(body.key);
    setName("");
    void load();
  }

  async function revokeKey(id: string) {
    if (armed !== id) {
      setArmed(id);
      window.setTimeout(() => setArmed((cur) => (cur === id ? null : cur)), 3000);
      return;
    }
    const revoked = keys.find((k) => k.id === id);
    await fetch(`/api/account/api-keys/${id}`, { method: "DELETE" });
    if (revoked && newKey?.startsWith(revoked.prefix)) {
      setNewKey(null);
      writePendingKey(null);
    }
    setArmed(null);
    void load();
  }

  function dismissNewKey() {
    setNewKey(null);
    writePendingKey(null);
  }

  async function copy(text: string, label: string) {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    window.setTimeout(() => setCopied(null), 1500);
  }

  const claudeCmd = newKey
    ? `claude mcp add --transport http tarineo ${mcpUrl} --header "Authorization: Bearer ${newKey}"`
    : "";

  return (
    <div id="agents" className="card-soft scroll-mt-24 p-5 sm:p-6">
      <p className="mono-label mb-3">{`/ Agents IA ///`}</p>
      <h2 className="text-[18px] font-semibold tracking-[-0.02em]">Connecter tes agents IA</h2>
      <p className="mt-1 max-w-prose text-[14px] leading-relaxed text-muted-foreground">
        Branche TARINEO à Claude Code, Claude Desktop, Cursor ou tes propres agents. Ils
        pourront lire ton Focus, créer des tâches et importer tes notes Obsidian.
      </p>

      {newKey ? (
        <div className="mt-5 rounded-card border border-st-pause bg-st-pause-soft p-4" role="status">
          <p className="text-[13.5px] font-medium text-st-pause-ink">
            Copie ta clé maintenant. TARINEO ne la stocke pas : si tu quittes
            sans copier, il faudra en créer une autre.
          </p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <code className="min-w-0 flex-1 overflow-x-auto rounded-lg bg-surface px-3 py-2 font-mono text-[12px]">
              {newKey}
            </code>
            <Button type="button" variant="outline" onClick={() => void copy(newKey, "key")}>
              {copied === "key" ? "Copiée" : "Copier"}
            </Button>
          </div>
          <p className="mt-3 text-[13px] text-st-pause-ink">Pour Claude Code, colle ça dans ton terminal :</p>
          <div className="mt-1 flex flex-col gap-2 sm:flex-row">
            <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap rounded-lg bg-surface px-3 py-2 font-mono text-[11px]">
              {claudeCmd}
            </code>
            <Button type="button" variant="outline" onClick={() => void copy(claudeCmd, "cmd")}>
              {copied === "cmd" ? "Copiée" : "Copier"}
            </Button>
          </div>
          <button
            type="button"
            onClick={dismissNewKey}
            className="mt-3 text-[13px] text-st-pause-ink underline"
          >
            J’ai copié ma clé
          </button>
        </div>
      ) : null}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex min-w-0 flex-1 flex-col gap-1.5 text-[13px] text-muted-foreground">
          Nom de la clé
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex. : Claude Code sur mon Mac"
            maxLength={60}
            className="h-11 rounded-xl"
          />
        </label>
        <label className="flex items-center gap-2 pb-2 text-[13.5px]">
          <Checkbox
            checked={canWrite}
            onCheckedChange={(v) => setCanWrite(v === true)}
          />
          Autoriser la modification
        </label>
        <button
          type="button"
          onClick={() => void createKey()}
          disabled={busy || !name.trim()}
          className={cn(
            "btn-dark inline-flex min-h-11 items-center justify-center rounded-pill px-5 text-[14px] font-medium",
            "disabled:opacity-40",
          )}
        >
          {busy ? "Création…" : "Créer une clé"}
        </button>
      </div>
      {error ? <p className="mt-2 text-[13.5px] text-destructive">{error}</p> : null}

      <ul className="mt-6 flex flex-col gap-1 border-t border-line pt-3">
        {keys.length === 0 ? (
          <li className="py-3 text-[14px] text-muted-foreground">
            Aucune clé. Crée-en une, puis copie le <span className="font-mono">npk_…</span> tout de suite.
          </li>
        ) : null}
        {keys.map((k) => (
          <li key={k.id} className="flex items-center justify-between gap-4 py-2.5">
            <div className="min-w-0">
              <p className="truncate text-[14.5px] font-medium">{k.name}</p>
              <p className="font-mono text-[11.5px] text-muted-foreground">
                {k.prefix}… · {k.scopes.includes("write") ? "lecture + écriture" : "lecture seule"} ·{" "}
                {formatDate(k.lastUsedAt)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void revokeKey(k.id)}
              className="shrink-0 text-[13px] text-destructive hover:underline"
            >
              {armed === k.id ? "Confirmer" : "Révoquer"}
            </button>
          </li>
        ))}
      </ul>
      {keys.length > 0 && !newKey ? (
        <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
          Le préfixe <span className="font-mono">npk_xxxx…</span> n’est pas la clé. Une clé oubliée
          ne peut pas être réaffichée : révoque-la, puis crée-en une nouvelle.
        </p>
      ) : null}
    </div>
  );
}

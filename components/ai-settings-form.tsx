"use client";

import { useState } from "react";
import { saveAiSettingsAction } from "@/lib/actions/settings";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function AiSettingsForm({ initialProvider, initialKey }: { initialProvider?: string | null; initialKey?: string | null }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [provider, setProvider] = useState(initialProvider || "");
  const [apiKey, setApiKey] = useState(initialKey || "");
  const hasKey = !!initialKey;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setErrorMsg(null);

    const fd = new FormData();
    fd.set("aiProvider", provider);
    fd.set("aiApiKey", apiKey);

    try {
      await saveAiSettingsAction(fd);
      setSaved(true);
      // Clear AI status cache so AI page shows updated status
      try { localStorage.removeItem("ollama_status_cache"); } catch {}
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    setProvider("");
    setApiKey("");
    setSaving(true);
    setErrorMsg(null);
    const fd = new FormData();
    fd.set("aiProvider", "");
    fd.set("aiApiKey", "");
    try {
      await saveAiSettingsAction(fd);
      setSaved(true);
      try { localStorage.removeItem("ollama_status_cache"); } catch {}
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to remove");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-text-muted">Provider</label>
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          className="h-12 w-full rounded-xl border border-border/60 bg-bg-elevated px-4 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">None (AI disabled)</option>
          <option value="groq">Groq (free)</option>
          <option value="openai">OpenAI</option>
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-text-muted">API Key</label>
        <Input
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          type="password"
          placeholder={hasKey ? "Saved key (type to change)" : "sk-... or gsk_..."}
        />
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          {saved && <p className="text-xs text-emerald font-medium">✅ Settings saved! (refresh AI page)</p>}
          {errorMsg && <p className="text-xs text-rose font-medium">❌ {errorMsg}</p>}
          {!saved && !errorMsg && hasKey && <p className="text-xs text-text-muted">Key is saved</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {hasKey && (
            <Button type="button" variant="ghost" size="sm" onClick={handleRemove} disabled={saving} className="text-xs text-rose">
              Remove
            </Button>
          )}
          <Button type="submit" size="sm" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </form>
  );
}

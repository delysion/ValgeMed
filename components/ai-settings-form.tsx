"use client";

import { useState } from "react";
import { saveAiSettingsAction } from "@/lib/actions/settings";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function AiSettingsForm({ initialProvider, initialKey }: { initialProvider?: string | null; initialKey?: string | null }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(false);

    const fd = new FormData(e.currentTarget);
    try {
      await saveAiSettingsAction(fd);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-text-muted">Provider</label>
        <select
          name="aiProvider"
          defaultValue={initialProvider || ""}
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
          name="aiApiKey"
          type="password"
          defaultValue={initialKey || ""}
          placeholder={initialKey ? "•••••••• (saved)" : "sk-... or gsk_..."}
        />
      </div>
      <div className="flex items-center justify-between">
        <div>
          {saved && <p className="text-xs text-emerald font-medium">✅ Settings saved!</p>}
          {error && <p className="text-xs text-rose font-medium">❌ Failed to save</p>}
          {!saved && !error && initialKey && <p className="text-xs text-text-muted">Key is saved</p>}
        </div>
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}

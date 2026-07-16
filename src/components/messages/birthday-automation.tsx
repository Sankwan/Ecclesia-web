"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import type { BirthdaySettings } from "@/lib/types";

const DEFAULT_TEMPLATE = "Happy birthday, {{firstName}}! God bless you. — {{churchName}}";

export function BirthdayAutomation({ churchId, settings }: { churchId: string; settings?: BirthdaySettings }) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(settings?.enabled ?? false);
  const [template, setTemplate] = useState(settings?.template ?? DEFAULT_TEMPLATE);
  const [pending, setPending] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  async function save(nextEnabled?: boolean) {
    const en = nextEnabled ?? enabled;
    setPending(true);
    setFlash(null);
    try {
      await apiFetch(`churches/${churchId}/birthday-automation`, {
        method: "PUT",
        body: { enabled: en, template },
      });
      setEnabled(en);
      setFlash("Saved");
      router.refresh();
    } catch (e) {
      setFlash(e instanceof ApiError ? e.message : "Could not save");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-line bg-surface p-5 shadow-[var(--shadow-sm)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-lg font-semibold">Automatic birthday SMS</h3>
          <p className="mt-1 text-sm text-ink-soft">
            Sent every morning at 7:00 (Accra) to members with a birthday that day. Skipped if your balance is short.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          disabled={pending}
          onClick={() => save(!enabled)}
          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${enabled ? "bg-verified" : "bg-line"}`}
        >
          <span
            className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-5" : "translate-x-0.5"}`}
          />
        </button>
      </div>

      <div className="mt-4">
        <p className="eyebrow mb-1.5">Message</p>
        <Textarea rows={2} value={template} onChange={(e) => setTemplate(e.target.value)} />
        <div className="mt-3 flex items-center gap-3">
          <Button onClick={() => save()} disabled={pending} className="px-4 py-2 text-sm">
            {pending ? "Saving…" : "Save message"}
          </Button>
          {flash && <span className="text-sm font-semibold text-verified">{flash}</span>}
        </div>
      </div>
    </div>
  );
}

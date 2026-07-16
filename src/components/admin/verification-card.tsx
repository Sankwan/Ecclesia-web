"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Chip } from "@/components/ui/chip";
import { Input } from "@/components/ui/input";
import { statusMeta } from "@/lib/status";
import type { VerificationRecord } from "@/lib/types";

export function VerificationCard({ record }: { record: VerificationRecord }) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [pending, setPending] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function review(approve: boolean) {
    setPending(approve ? "approve" : "reject");
    setError(null);
    try {
      await apiFetch(`admin/verifications/${record.id}/review`, {
        method: "POST",
        body: { approve, notes: notes || undefined },
      });
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not submit");
      setPending(null);
    }
  }

  const level = statusMeta(record.level);
  const evidence = Object.entries(record.evidence ?? {});

  return (
    <div className="rounded-[var(--radius-lg)] border border-line bg-surface p-5 shadow-[var(--shadow-sm)]">
      <div className="flex items-start gap-3">
        <Avatar name={record.provider.displayName} size={48} />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-display text-lg font-semibold leading-tight">{record.provider.displayName}</p>
            <Chip tone="blue">Requesting: {level.label}</Chip>
          </div>
          <p className="mt-0.5 text-sm text-ink-soft">
            {record.provider.user.fullName} · {record.provider.user.phone} · {record.provider.areaLabel}
          </p>
        </div>
        <p className="font-data text-xs text-ink-faint">
          {new Date(record.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
        </p>
      </div>

      {evidence.length > 0 && (
        <dl className="mt-4 grid gap-x-6 gap-y-1.5 rounded-[var(--radius)] bg-surface-sunken p-3 text-sm sm:grid-cols-2">
          {evidence.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3">
              <dt className="text-ink-faint">{k}</dt>
              <dd className="text-right font-medium">{String(v)}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Input
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="max-w-xs"
        />
        <div className="ml-auto flex gap-2">
          <Button variant="secondary" disabled={pending !== null} onClick={() => review(false)}>
            {pending === "reject" ? "Rejecting…" : "Reject"}
          </Button>
          <Button disabled={pending !== null} onClick={() => review(true)}>
            {pending === "approve" ? "Approving…" : "Approve"}
          </Button>
        </div>
      </div>
      {error && <p className="mt-2 text-sm font-semibold text-emergency">{error}</p>}
    </div>
  );
}

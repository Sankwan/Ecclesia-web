"use client";

import { useState } from "react";
import { apiFetch, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TopupPanel({ churchId, balance }: { churchId: string; balance: number }) {
  const [open, setOpen] = useState(false);
  const [units, setUnits] = useState(500);
  const [ref, setRef] = useState("");
  const [pending, setPending] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  async function submit() {
    setPending(true);
    setFlash(null);
    try {
      await apiFetch(`churches/${churchId}/sms/topup`, {
        method: "POST",
        body: { units, momoReference: ref || undefined },
      });
      setFlash("Request sent — an admin will confirm your MoMo payment and add the credits.");
      setOpen(false);
    } catch (e) {
      setFlash(e instanceof ApiError ? e.message : "Could not send request");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-line bg-surface p-5 shadow-[var(--shadow-sm)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="eyebrow">SMS balance</p>
          <p className="font-display text-3xl font-semibold tabular-nums">{balance}</p>
        </div>
        <Button variant="secondary" onClick={() => setOpen(!open)}>
          Top up
        </Button>
      </div>

      {open && (
        <div className="mt-4 flex flex-col gap-3 border-t border-line pt-4">
          <p className="text-sm text-ink-soft">
            Pay by MoMo, then log the request here. A platform admin verifies and credits your account (no automatic
            payment in v1).
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold">Credits</span>
              <Input type="number" min={1} value={units} onChange={(e) => setUnits(Number(e.target.value))} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold">MoMo reference</span>
              <Input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="MP230716.1234.A12345" />
            </label>
          </div>
          <div>
            <Button onClick={submit} disabled={pending}>
              {pending ? "Sending…" : "Send request"}
            </Button>
          </div>
        </div>
      )}
      {flash && <p className="mt-3 text-sm font-semibold text-verified">{flash}</p>}
    </div>
  );
}

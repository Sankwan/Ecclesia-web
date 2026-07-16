"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Chip } from "@/components/ui/chip";
import { Input } from "@/components/ui/input";
import { Contact } from "@/components/admin/contact";
import { SuspendButton } from "@/components/admin/suspend-button";
import type { AdminChurch, AdminNotification } from "@/lib/types";

function lastActive(iso: string | null): { label: string; dormant: boolean } {
  if (!iso) return { label: "never posted", dormant: true };
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / (24 * 60 * 60 * 1000));
  if (days === 0) return { label: "active today", dormant: false };
  return { label: `${days}d ago`, dormant: days >= 21 };
}

export function ChurchesAdmin({
  churches,
  notifications,
}: {
  churches: AdminChurch[];
  notifications: AdminNotification[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [creditUnits, setCreditUnits] = useState<Record<string, number>>({});

  const byId = new Map(churches.map((c) => [c.id, c]));
  const topups = notifications.filter((n) => (n.data as { type?: string }).type === "sms_topup_request");

  async function verify(c: AdminChurch) {
    setBusy(`verify:${c.id}`);
    try {
      await apiFetch(`admin/churches/${c.id}/verify`, { method: "POST" });
      setFlash(`${c.name} verified`);
      router.refresh();
    } catch (e) {
      setFlash(e instanceof ApiError ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
  }

  async function credit(churchId: string, units: number, name: string) {
    if (units <= 0) return;
    setBusy(`credit:${churchId}`);
    try {
      await apiFetch(`admin/sms/credits`, { method: "POST", body: { churchId, units } });
      setFlash(`Credited ${units} to ${name}`);
      setCreditUnits((u) => ({ ...u, [churchId]: 0 }));
      router.refresh();
    } catch (e) {
      setFlash(e instanceof ApiError ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      {flash && (
        <p className="mb-4 rounded-[var(--radius)] bg-verified-tint px-3 py-2 text-sm font-semibold text-verified">
          {flash}
        </p>
      )}

      {/* Top-up requests */}
      {topups.length > 0 && (
        <section className="mb-8">
          <h2 className="font-display text-xl font-semibold">Top-up requests</h2>
          <div className="mt-3 flex flex-col gap-2">
            {topups.map((n) => {
              const data = n.data as { churchId?: string; units?: number };
              const church = data.churchId ? byId.get(data.churchId) : undefined;
              const units = data.units ?? 0;
              return (
                <div
                  key={n.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-gold/40 bg-gold-tint p-4"
                >
                  <div>
                    <p className="font-semibold">{church?.name ?? "A church"} — {units} credits</p>
                    <p className="text-sm text-ink-soft">{n.body}</p>
                  </div>
                  {church && (
                    <Button
                      disabled={busy !== null}
                      onClick={() => credit(church.id, units, church.name)}
                    >
                      {busy === `credit:${church.id}` ? "Crediting…" : `Credit ${units}`}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* All churches */}
      <h2 className="font-display text-xl font-semibold">All churches</h2>
      <div className="mt-3 flex flex-col gap-2">
        {churches.map((c) => {
          const active = lastActive(c.lastRequestAt);
          return (
            <div
              key={c.id}
              className="rounded-[var(--radius-lg)] border border-line bg-surface p-4 shadow-[var(--shadow-sm)]"
            >
              <div className="flex flex-wrap items-start gap-3">
                <Avatar name={c.name} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{c.name}</p>
                    {c.isVerified ? <Chip tone="green">Verified</Chip> : <Chip tone="neutral">Unverified</Chip>}
                    {active.dormant && <Chip tone="gold">Dormant · {active.label}</Chip>}
                  </div>
                  <p className="text-sm text-ink-soft">
                    {c.areaLabel} · {c._count.members} members · {c._count.bookings} bookings ·{" "}
                    <span className="font-data">{c.smsBalance} credits</span>
                    {!active.dormant && <span> · last request {active.label}</span>}
                  </p>
                  {c.admin && (
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <Contact label="Admin:" name={c.admin.fullName} phone={c.admin.phone} />
                      {!c.admin.isActive && <Chip tone="red">Suspended</Chip>}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    placeholder="units"
                    value={creditUnits[c.id] || ""}
                    onChange={(e) => setCreditUnits((u) => ({ ...u, [c.id]: Number(e.target.value) }))}
                    className="w-24"
                  />
                  <Button
                    variant="secondary"
                    disabled={busy !== null || !creditUnits[c.id]}
                    onClick={() => credit(c.id, creditUnits[c.id] || 0, c.name)}
                  >
                    {busy === `credit:${c.id}` ? "…" : "Credit"}
                  </Button>
                  {!c.isVerified && (
                    <Button disabled={busy !== null} onClick={() => verify(c)}>
                      {busy === `verify:${c.id}` ? "…" : "Verify"}
                    </Button>
                  )}
                  {c.admin && <SuspendButton userId={c.admin.id} isActive={c.admin.isActive} name={c.admin.fullName} />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

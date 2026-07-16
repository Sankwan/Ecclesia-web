"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Chip } from "@/components/ui/chip";
import { Input, Select } from "@/components/ui/input";
import { Contact } from "@/components/admin/contact";
import { SuspendButton } from "@/components/admin/suspend-button";
import { statusMeta } from "@/lib/status";
import type { AdminProvider } from "@/lib/types";

// Reliability = completed / (completed + cancelled + 2·no-shows). Mirrors the
// backend's matching prior conceptually; a quick trust read for the operator.
function reliability(p: AdminProvider): number | null {
  const denom = p.completedCount + p.cancelledCount + 2 * p.noShowCount;
  return denom === 0 ? null : Math.round((p.completedCount / denom) * 100);
}

export function ProvidersDirectory({ providers }: { providers: AdminProvider[] }) {
  const [search, setSearch] = useState("");
  const [verification, setVerification] = useState("");
  const [availability, setAvailability] = useState("");

  const filtered = providers.filter((p) => {
    if (search && !p.displayName.toLowerCase().includes(search.toLowerCase()) && !p.user.phone.includes(search))
      return false;
    if (verification && p.verification !== verification) return false;
    if (availability && p.availability !== availability) return false;
    return true;
  });

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <Input placeholder="Search name or phone…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-56" />
        <Select value={verification} onChange={(e) => setVerification(e.target.value)} className="max-w-44">
          <option value="">Any verification</option>
          <option value="UNVERIFIED">Unverified</option>
          <option value="ID_VERIFIED">ID verified</option>
          <option value="SKILL_VERIFIED">Skill verified</option>
          <option value="TRUSTED">Trusted</option>
        </Select>
        <Select value={availability} onChange={(e) => setAvailability(e.target.value)} className="max-w-40">
          <option value="">Any status</option>
          <option value="AVAILABLE">Available</option>
          <option value="BUSY">Busy</option>
          <option value="UNAVAILABLE">Unavailable</option>
        </Select>
        <span className="ml-auto text-sm text-ink-faint">
          {filtered.length} of {providers.length}
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {filtered.map((p) => {
          const v = statusMeta(p.verification);
          const a = statusMeta(p.availability);
          const rel = reliability(p);
          return (
            <div
              key={p.id}
              className="flex flex-wrap items-start gap-3 rounded-[var(--radius-lg)] border border-line bg-surface p-4 shadow-[var(--shadow-sm)]"
            >
              <Avatar name={p.displayName} size={44} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display text-lg font-semibold leading-tight">{p.displayName}</p>
                  <Chip tone={v.tone}>{v.label}</Chip>
                  <Chip tone={a.tone}>{a.label}</Chip>
                  {!p.user.isActive && <Chip tone="red">Suspended</Chip>}
                </div>
                <p className="mt-0.5 text-sm text-ink-soft">
                  {p.areaLabel} · {p.skills.map((s) => s.name).join(", ") || "no skills"}
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-ink-soft">
                  {p.rating != null && (
                    <span className="text-gold">
                      ★ {p.rating} <span className="text-ink-faint">({p.ratingCount})</span>
                    </span>
                  )}
                  <span>{p.completedCount} done</span>
                  {p.cancelledCount > 0 && <span className="text-gold">{p.cancelledCount} cancelled</span>}
                  {p.noShowCount > 0 && <span className="text-emergency">{p.noShowCount} no-show</span>}
                  {rel != null && <span>· {rel}% reliable</span>}
                </p>
                <div className="mt-2">
                  <Contact name={p.user.fullName} phone={p.user.phone} />
                </div>
              </div>
              <SuspendButton userId={p.user.id} isActive={p.user.isActive} name={p.displayName} />
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="rounded-[var(--radius-lg)] border border-dashed border-line bg-surface p-8 text-center text-ink-soft">
            No providers match.
          </p>
        )}
      </div>
    </div>
  );
}

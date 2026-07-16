"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Input, Select } from "@/components/ui/input";
import { MemberForm } from "./member-form";
import { ImportPanel } from "./import-panel";
import type { ChurchMember } from "@/lib/types";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function birthdayLabel(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  const day = d.getUTCDate();
  const month = MONTHS[d.getUTCMonth()];
  const year = d.getUTCFullYear();
  return year <= 1900 ? `${day} ${month}` : `${day} ${month} ${year}`;
}

export function MembersManager({ churchId, initial }: { churchId: string; initial: ChurchMember[] }) {
  const router = useRouter();
  // Read the server-fetched prop directly so router.refresh() (after add/edit/
  // delete/import) reflects immediately — caching it in state would go stale.
  const members = initial;
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState("");
  const [month, setMonth] = useState("");
  const [panel, setPanel] = useState<"none" | "add" | "import">("none");
  const [editing, setEditing] = useState<ChurchMember | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const groups = Array.from(new Set(members.map((m) => m.group).filter(Boolean))) as string[];

  const filtered = members.filter((m) => {
    if (search && !m.fullName.toLowerCase().includes(search.toLowerCase())) return false;
    if (group && m.group !== group) return false;
    if (month && (!m.birthday || new Date(m.birthday).getUTCMonth() + 1 !== Number(month))) return false;
    return true;
  });

  function refresh(message?: string) {
    if (message) setFlash(message);
    setPanel("none");
    setEditing(null);
    router.refresh();
  }

  async function remove(m: ChurchMember) {
    if (!confirm(`Remove ${m.fullName}?`)) return;
    try {
      await apiFetch(`churches/${churchId}/members/${m.id}`, { method: "DELETE" });
      refresh(`${m.fullName} removed`);
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Could not remove");
    }
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search members…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-52"
        />
        <Select value={group} onChange={(e) => setGroup(e.target.value)} className="max-w-40">
          <option value="">All groups</option>
          {groups.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </Select>
        <Select value={month} onChange={(e) => setMonth(e.target.value)} className="max-w-40">
          <option value="">Any birthday month</option>
          {MONTHS.map((m, i) => (
            <option key={m} value={i + 1}>
              {m}
            </option>
          ))}
        </Select>
        <div className="ml-auto flex gap-2">
          <Button variant="secondary" onClick={() => setPanel(panel === "import" ? "none" : "import")}>
            Import CSV
          </Button>
          <Button onClick={() => { setEditing(null); setPanel(panel === "add" ? "none" : "add"); }}>
            + Add member
          </Button>
        </div>
      </div>

      {flash && (
        <p className="mt-3 rounded-[var(--radius)] bg-verified-tint px-3 py-2 text-sm font-semibold text-verified">
          {flash}
        </p>
      )}

      {panel === "add" && !editing && (
        <div className="mt-4">
          <MemberForm churchId={churchId} onDone={() => refresh("Member added")} onCancel={() => setPanel("none")} />
        </div>
      )}
      {panel === "import" && (
        <div className="mt-4">
          <ImportPanel
            churchId={churchId}
            onDone={(imported, skipped) => refresh(`Imported ${imported}${skipped ? `, skipped ${skipped}` : ""}`)}
            onCancel={() => setPanel("none")}
          />
        </div>
      )}
      {editing && (
        <div className="mt-4">
          <MemberForm
            churchId={churchId}
            member={editing}
            onDone={() => refresh("Member updated")}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      {/* List */}
      <p className="mt-6 text-sm text-ink-faint">
        {filtered.length} of {members.length} member{members.length === 1 ? "" : "s"}
      </p>
      <div className="mt-2 overflow-hidden rounded-[var(--radius-lg)] border border-line">
        {filtered.length === 0 ? (
          <p className="bg-surface p-8 text-center text-ink-soft">No members match.</p>
        ) : (
          filtered.map((m, i) => (
            <div
              key={m.id}
              className={`flex items-center gap-3 bg-surface px-4 py-3 ${i > 0 ? "border-t border-line" : ""}`}
            >
              <Avatar name={m.fullName} size={40} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{m.fullName}</p>
                <p className="truncate text-sm text-ink-soft">
                  {[m.group, birthdayLabel(m.birthday) && `🎂 ${birthdayLabel(m.birthday)}`, m.phone]
                    .filter(Boolean)
                    .join(" · ") || "No details"}
                </p>
              </div>
              {m.phone && !m.smsConsent && <span className="text-xs text-ink-faint">SMS off</span>}
              <button
                onClick={() => { setPanel("none"); setEditing(m); }}
                className="rounded-[var(--radius-sm)] px-2 py-1 text-sm font-semibold text-ink-soft hover:bg-surface-sunken hover:text-ink"
              >
                Edit
              </button>
              <button
                onClick={() => remove(m)}
                className="rounded-[var(--radius-sm)] px-2 py-1 text-sm font-semibold text-emergency hover:bg-emergency-tint"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

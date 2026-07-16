"use client";

import { useState, FormEvent } from "react";
import { apiFetch, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import type { ChurchMember } from "@/lib/types";

const GROUPS = ["Choir", "Ushers", "Youth", "Media", "Band", "Leadership", "Children"];

export function MemberForm({
  churchId,
  member,
  onDone,
  onCancel,
}: {
  churchId: string;
  member?: ChurchMember;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    fullName: member?.fullName ?? "",
    phone: member?.phone ?? "",
    gender: member?.gender ?? "",
    birthday: member?.birthday ? member.birthday.slice(0, 10) : "",
    group: member?.group ?? "",
    smsConsent: member?.smsConsent ?? true,
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const body = {
      fullName: form.fullName,
      phone: form.phone || undefined,
      gender: form.gender || undefined,
      birthday: form.birthday || undefined,
      group: form.group || undefined,
      smsConsent: form.smsConsent,
    };
    try {
      if (member) {
        await apiFetch(`churches/${churchId}/members/${member.id}`, { method: "PATCH", body });
      } else {
        await apiFetch(`churches/${churchId}/members`, { method: "POST", body });
      }
      onDone();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not save member");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-[var(--radius-lg)] border border-line bg-surface p-5 shadow-[var(--shadow-sm)]"
    >
      <h3 className="font-display text-lg font-semibold">{member ? "Edit member" : "Add member"}</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Full name">
          <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required autoFocus />
        </Field>
        <Field label="Phone" hint="Optional — needed for SMS">
          <Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </Field>
        <Field label="Birthday" hint="Year optional; use 1900 if unknown">
          <Input type="date" value={form.birthday} onChange={(e) => setForm({ ...form, birthday: e.target.value })} />
        </Field>
        <Field label="Group">
          <Select value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value })}>
            <option value="">No group</option>
            {GROUPS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Gender">
          <Select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
            <option value="">—</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
          </Select>
        </Field>
        <label className="flex items-center gap-2 self-end pb-2.5 text-sm">
          <input
            type="checkbox"
            checked={form.smsConsent}
            onChange={(e) => setForm({ ...form, smsConsent: e.target.checked })}
            className="h-4 w-4 accent-[var(--clay)]"
          />
          Consents to SMS
        </label>
      </div>
      {error && <p className="mt-3 text-sm font-semibold text-emergency">{error}</p>}
      <div className="mt-4 flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : member ? "Save changes" : "Add member"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

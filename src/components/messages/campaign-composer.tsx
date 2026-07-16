"use client";

import { useMemo, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Field, Select, Textarea } from "@/components/ui/input";
import type { ChurchMember } from "@/lib/types";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// GSM-7 segment estimate mirroring the backend's smsUnits().
function estimateUnits(body: string): number {
  const gsm7 = /^[\x20-\x7E\n\r]*$/.test(body);
  const single = gsm7 ? 160 : 70;
  const multi = gsm7 ? 153 : 67;
  return body.length === 0 ? 0 : body.length <= single ? 1 : Math.ceil(body.length / multi);
}

export function CampaignComposer({
  churchId,
  churchName,
  members,
  balance,
}: {
  churchId: string;
  churchName: string;
  members: ChurchMember[];
  balance: number;
}) {
  const router = useRouter();
  const [template, setTemplate] = useState("Dear {{firstName}}, ");
  const [group, setGroup] = useState("");
  const [month, setMonth] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const groups = Array.from(new Set(members.map((m) => m.group).filter(Boolean))) as string[];

  // Reachable recipients = has phone + consent + matches filter.
  const recipients = useMemo(
    () =>
      members.filter((m) => {
        if (!m.phone || !m.smsConsent) return false;
        if (group && m.group !== group) return false;
        if (month && (!m.birthday || new Date(m.birthday).getUTCMonth() + 1 !== Number(month))) return false;
        return true;
      }),
    [members, group, month],
  );

  const perMessageUnits = estimateUnits(template.replace(/\{\{.*?\}\}/g, "Xxxxx"));
  const estCost = perMessageUnits * recipients.length;
  const affordable = estCost <= balance;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setPending(true);
    try {
      const res = await apiFetch<{ recipients: number; creditsDebited: number }>(
        `churches/${churchId}/sms/campaigns`,
        {
          method: "POST",
          idempotencyKey: crypto.randomUUID(),
          body: {
            template,
            memberFilter: {
              ...(group ? { group } : {}),
              ...(month ? { birthdayMonth: Number(month) } : {}),
            },
          },
        },
      );
      setResult(`Sent to ${res.recipients} member(s), ${res.creditsDebited} credits used.`);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not send");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-[var(--radius-lg)] border border-line bg-surface p-5 shadow-[var(--shadow-sm)]">
      <h3 className="font-display text-lg font-semibold">New message</h3>
      <p className="mt-1 text-sm text-ink-soft">
        Use <code className="font-data text-xs">{"{{firstName}}"}</code> and{" "}
        <code className="font-data text-xs">{"{{churchName}}"}</code> — they&apos;re filled per person.
      </p>

      <div className="mt-4 flex flex-col gap-4">
        <Field label="Message">
          <Textarea rows={4} value={template} onChange={(e) => setTemplate(e.target.value)} required />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Send to group">
            <Select value={group} onChange={(e) => setGroup(e.target.value)}>
              <option value="">All groups</option>
              {groups.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Only birthday month">
            <Select value={month} onChange={(e) => setMonth(e.target.value)}>
              <option value="">Any</option>
              {MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        {/* Live preview */}
        <div className="rounded-[var(--radius)] bg-surface-sunken p-3">
          <p className="eyebrow">Preview</p>
          <p className="mt-1 text-sm">
            {template
              .replace(/\{\{\s*firstName\s*\}\}/g, recipients[0]?.fullName.split(/\s+/)[0] ?? "Ama")
              .replace(/\{\{\s*churchName\s*\}\}/g, churchName)}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-soft">
            <strong className="text-ink">{recipients.length}</strong> reachable · est.{" "}
            <strong className={affordable ? "text-ink" : "text-emergency"}>{estCost}</strong> credits · balance {balance}
          </p>
          <Button type="submit" disabled={pending || recipients.length === 0 || !affordable}>
            {pending ? "Sending…" : "Send now"}
          </Button>
        </div>
        {!affordable && recipients.length > 0 && (
          <p className="text-sm font-semibold text-emergency">Not enough credits — top up below.</p>
        )}
        {error && <p className="text-sm font-semibold text-emergency">{error}</p>}
        {result && (
          <p className="rounded-[var(--radius)] bg-verified-tint px-3 py-2 text-sm font-semibold text-verified">
            {result}
          </p>
        )}
      </div>
    </form>
  );
}

"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { apiFetch, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import type { Skill, Urgency } from "@/lib/types";

export function NewRequestForm({ churchId, skills }: { churchId: string; skills: Skill[] }) {
  const router = useRouter();
  const [urgency, setUrgency] = useState<Urgency>("EMERGENCY");
  const [form, setForm] = useState({
    skillSlug: skills[0]?.slug ?? "",
    serviceDate: "",
    startTime: "16:00",
    budgetMinGhs: 200,
    budgetMaxGhs: 400,
    rehearsalNote: "",
    notes: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const data = await apiFetch<{ id: string }>("requests", {
        method: "POST",
        idempotencyKey: crypto.randomUUID(),
        body: { churchId, urgency, ...form },
      });
      router.push(`/app/church/${churchId}/requests/${data.id}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Post a need</h1>
      <Card className="mt-6 max-w-xl">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <span className="eyebrow">
              How urgent?
            </span>
            <div className="mt-1.5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUrgency("EMERGENCY")}
                className={clsx(
                  "rounded-[var(--radius)] border border-emergency px-3 py-3 text-left font-display text-sm font-bold",
                  urgency === "EMERGENCY" ? "bg-emergency text-white" : "text-emergency hover:bg-surface-sunken",
                )}
              >
                Emergency
                <span className="mt-0.5 block text-xs font-normal normal-case opacity-80">
                  Needed within ~24h
                </span>
              </button>
              <button
                type="button"
                onClick={() => setUrgency("SCHEDULED")}
                className={clsx(
                  "rounded-full border border-scheduled px-3 py-3 text-left font-display text-sm font-bold",
                  urgency === "SCHEDULED"
                    ? "bg-scheduled text-white"
                    : "text-scheduled hover:bg-surface-sunken",
                )}
              >
                Scheduled
                <span className="mt-0.5 block text-xs font-normal normal-case opacity-80">
                  Planned ahead
                </span>
              </button>
            </div>
          </div>

          <Field label="Skill needed">
            <Select value={form.skillSlug} onChange={(e) => setForm({ ...form, skillSlug: e.target.value })} required>
              {skills.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </Select>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Service date">
              <Input
                type="date"
                value={form.serviceDate}
                onChange={(e) => setForm({ ...form, serviceDate: e.target.value })}
                required
              />
            </Field>
            <Field label="Start time">
              <Input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                required
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Budget min (GHS)">
              <Input
                type="number"
                min={0}
                value={form.budgetMinGhs}
                onChange={(e) => setForm({ ...form, budgetMinGhs: Number(e.target.value) })}
                required
              />
            </Field>
            <Field label="Budget max (GHS)">
              <Input
                type="number"
                min={0}
                value={form.budgetMaxGhs}
                onChange={(e) => setForm({ ...form, budgetMaxGhs: Number(e.target.value) })}
                required
              />
            </Field>
          </div>

          <Field label="Rehearsal note (optional)" hint="e.g. Rehearsal 2:30pm same day">
            <Input
              value={form.rehearsalNote}
              onChange={(e) => setForm({ ...form, rehearsalNote: e.target.value })}
            />
          </Field>

          <Field label="Notes for providers (optional)">
            <Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Field>

          {error && <p className="text-sm font-semibold text-emergency">{error}</p>}
          <Button type="submit" disabled={pending}>
            {pending ? "Posting…" : "Post request"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

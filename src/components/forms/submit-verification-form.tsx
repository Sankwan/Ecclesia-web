"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

export function SubmitVerificationForm() {
  const router = useRouter();
  const [form, setForm] = useState({ idType: "Ghana Card", idLastFour: "", referenceChurch: "" });
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await apiFetch("providers/me/verification", { method: "POST", body: { evidence: form } });
      setDone(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not submit");
    } finally {
      setPending(false);
    }
  }

  if (done) return <p className="text-sm text-verified font-semibold">Submitted — a platform admin will review it.</p>;

  return (
    <form onSubmit={submit} className="mt-3 flex max-w-sm flex-col gap-3">
      <Field label="ID type">
        <Input value={form.idType} onChange={(e) => setForm({ ...form, idType: e.target.value })} required />
      </Field>
      <Field label="ID last 4 digits">
        <Input
          maxLength={4}
          value={form.idLastFour}
          onChange={(e) => setForm({ ...form, idLastFour: e.target.value.replace(/\D/g, "") })}
          required
        />
      </Field>
      <Field label="Reference church (optional)">
        <Input value={form.referenceChurch} onChange={(e) => setForm({ ...form, referenceChurch: e.target.value })} />
      </Field>
      {error && <p className="text-sm font-semibold text-emergency">{error}</p>}
      <Button type="submit" disabled={pending} className="px-4 py-2 text-xs">
        {pending ? "Submitting…" : "Submit for review"}
      </Button>
    </form>
  );
}

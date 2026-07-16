"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";

export function CreateChurchForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", areaLabel: "", phone: "", denomination: "" });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      // Accra city-centre default — the church can refine this later via PATCH.
      await apiFetch("churches", {
        method: "POST",
        body: { ...form, latitude: 5.6037, longitude: -0.187 },
      });
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="max-w-lg">
      <h2 className="font-display text-xl font-bold">Set up your church</h2>
      <p className="mt-1 text-sm text-ink-soft">You&apos;ll become its first admin.</p>
      <form onSubmit={submit} className="mt-5 flex flex-col gap-4">
        <Field label="Church name">
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required autoFocus />
        </Field>
        <Field label="Area" hint="e.g. Adenta, Haatso, East Legon">
          <Input value={form.areaLabel} onChange={(e) => setForm({ ...form, areaLabel: e.target.value })} required />
        </Field>
        <Field label="Denomination (optional)">
          <Input value={form.denomination} onChange={(e) => setForm({ ...form, denomination: e.target.value })} />
        </Field>
        <Field label="Church phone">
          <Input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />
        </Field>
        {error && <p className="text-sm font-semibold text-emergency">{error}</p>}
        <Button type="submit" disabled={pending}>
          {pending ? "Creating…" : "Create church"}
        </Button>
      </form>
    </Card>
  );
}

"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { apiFetch, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import type { Skill } from "@/lib/types";

export function CreateProviderForm({ skills }: { skills: Skill[] }) {
  const router = useRouter();
  const [form, setForm] = useState({ displayName: "", areaLabel: "" });
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function toggleSkill(slug: string) {
    setSelected((s) => (s.includes(slug) ? s.filter((x) => x !== slug) : [...s, slug]));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (selected.length === 0) {
      setError("Pick at least one skill.");
      return;
    }
    setError(null);
    setPending(true);
    try {
      // Accra city-centre default — refine later from the profile page.
      await apiFetch("providers", { method: "POST", body: { ...form, latitude: 5.6037, longitude: -0.187 } });
      await apiFetch("providers/me/skills", {
        method: "PUT",
        body: { skills: selected.map((skillSlug) => ({ skillSlug, years: 1 })) },
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
      <h2 className="font-display text-xl font-bold">Set up your provider profile</h2>
      <p className="mt-1 text-sm text-ink-soft">Churches see this when you apply.</p>
      <form onSubmit={submit} className="mt-5 flex flex-col gap-4">
        <Field label="Display name" hint="e.g. Kojo the Drummer">
          <Input value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} required autoFocus />
        </Field>
        <Field label="Area" hint="e.g. Adenta, Haatso">
          <Input value={form.areaLabel} onChange={(e) => setForm({ ...form, areaLabel: e.target.value })} required />
        </Field>
        <div>
          <span className="eyebrow">Skills</span>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {skills.map((s) => (
              <button
                key={s.slug}
                type="button"
                onClick={() => toggleSkill(s.slug)}
                className={clsx(
                  "rounded-full border border-line px-3 py-1.5 font-display text-xs font-bold",
                  selected.includes(s.slug) ? "bg-clay text-clay-ink" : "hover:bg-surface-sunken",
                )}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
        {error && <p className="text-sm font-semibold text-emergency">{error}</p>}
        <Button type="submit" disabled={pending}>
          {pending ? "Creating…" : "Create profile"}
        </Button>
      </form>
    </Card>
  );
}

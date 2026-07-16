"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { apiFetch, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import type { ProviderProfile, Skill } from "@/lib/types";

export function EditSkillsForm({ profile, skills }: { profile: ProviderProfile; skills: Skill[] }) {
  const router = useRouter();
  const [years, setYears] = useState<Record<string, number>>(
    Object.fromEntries(profile.skills.map((s) => [s.skill.slug, s.years])),
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function toggle(slug: string) {
    setYears((y) => {
      const next = { ...y };
      if (slug in next) delete next[slug];
      else next[slug] = 1;
      return next;
    });
  }

  async function save() {
    setError(null);
    setPending(true);
    try {
      await apiFetch("providers/me/skills", {
        method: "PUT",
        body: { skills: Object.entries(years).map(([skillSlug, y]) => ({ skillSlug, years: y })) },
      });
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not save");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {skills.map((s) => {
          const active = s.slug in years;
          return (
            <div key={s.slug} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => toggle(s.slug)}
                className={clsx(
                  "rounded-full border border-line px-3 py-1.5 font-display text-xs font-bold",
                  active ? "bg-clay text-clay-ink" : "hover:bg-surface-sunken",
                )}
              >
                {s.name}
              </button>
              {active && (
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={years[s.slug]}
                  onChange={(e) => setYears((y) => ({ ...y, [s.slug]: Number(e.target.value) }))}
                  className="w-14 rounded-full border border-line bg-surface px-2 py-1.5 font-data text-xs"
                  aria-label={`Years of experience: ${s.name}`}
                />
              )}
            </div>
          );
        })}
      </div>
      {error && <p className="mt-2 text-sm font-semibold text-emergency">{error}</p>}
      <Button onClick={save} disabled={pending} className="mt-4 px-4 py-2 text-xs">
        {pending ? "Saving…" : "Save skills"}
      </Button>
    </div>
  );
}

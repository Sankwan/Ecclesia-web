"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { apiFetch, ApiError } from "@/lib/api-client";
import type { AvailabilityStatus } from "@/lib/types";

const OPTIONS: { value: AvailabilityStatus; label: string }[] = [
  { value: "AVAILABLE", label: "Available" },
  { value: "BUSY", label: "Busy" },
  { value: "UNAVAILABLE", label: "Unavailable" },
];

export function AvailabilityToggle({ current }: { current: AvailabilityStatus }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function setStatus(status: AvailabilityStatus) {
    if (status === current) return;
    setPending(true);
    try {
      await apiFetch("providers/me/availability", { method: "PUT", body: { status } });
      router.refresh();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Could not update availability");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex gap-2">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          disabled={pending}
          onClick={() => setStatus(o.value)}
          className={clsx(
            "rounded-full border border-line px-3 py-1.5 font-display text-xs font-bold disabled:opacity-50",
            o.value === current
              ? o.value === "AVAILABLE"
                ? "bg-verified text-white border-verified"
                : o.value === "BUSY"
                  ? "bg-gold text-white border-gold"
                  : "bg-text-primary text-surface"
              : "hover:bg-surface-sunken",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

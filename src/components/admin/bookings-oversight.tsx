"use client";

import { useState } from "react";
import { Chip } from "@/components/ui/chip";
import { Contact } from "@/components/admin/contact";
import { statusMeta } from "@/lib/status";
import type { AdminBooking } from "@/lib/types";

const FILTERS: { value: string; label: string }[] = [
  { value: "", label: "All" },
  { value: "DISPUTED", label: "Disputed" },
  { value: "NO_SHOW", label: "No-shows" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "CHECKED_IN", label: "Checked in" },
  { value: "COMPLETED", label: "Completed" },
];

export function BookingsOversight({ bookings }: { bookings: AdminBooking[] }) {
  const [filter, setFilter] = useState("");
  const shown = filter ? bookings.filter((b) => b.status === filter) : bookings;

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={
              filter === f.value
                ? "rounded-full bg-clay px-3 py-1 text-sm font-semibold text-clay-ink"
                : "rounded-full border border-line px-3 py-1 text-sm font-semibold text-ink-soft hover:bg-surface-sunken"
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {shown.map((b) => {
          const s = statusMeta(b.status);
          return (
            <div
              key={b.id}
              className="rounded-[var(--radius-lg)] border border-line bg-surface p-4 shadow-[var(--shadow-sm)]"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Chip tone={s.tone}>{s.label}</Chip>
                <span className="font-semibold">{b.skill}</span>
                <span className="text-sm text-ink-soft">
                  {new Date(b.serviceDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} at{" "}
                  {b.startTime}
                </span>
                <span className="ml-auto font-data text-sm text-ink-soft">GHS {b.agreedGhs}</span>
              </div>
              {b.cancelReason && <p className="mt-1 text-sm text-emergency">Reason: {b.cancelReason}</p>}
              <div className="mt-2 flex flex-col gap-1">
                <Contact label="Church:" name={b.church.name} phone={b.church.phone} />
                <Contact label="Provider:" name={b.provider.displayName} phone={b.provider.phone} />
              </div>
            </div>
          );
        })}
        {shown.length === 0 && (
          <p className="rounded-[var(--radius-lg)] border border-dashed border-line bg-surface p-8 text-center text-ink-soft">
            No bookings in this view.
          </p>
        )}
      </div>
    </div>
  );
}

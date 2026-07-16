import { serverApiFetch } from "@/lib/api-server";
import type { Metrics } from "@/lib/types";

function pct(v: number | null): string {
  return v == null ? "—" : `${v}%`;
}

function duration(mins: number | null): string {
  if (mins == null) return "—";
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export default async function MetricsPage() {
  const m = await serverApiFetch<Metrics>("/admin/metrics");

  const kpis = [
    {
      label: "Fill rate",
      value: pct(m.fillRate),
      sub: `${m.requests.booked} of ${m.requests.total} requests booked`,
      accent: "clay" as const,
    },
    {
      label: "Median time-to-fill",
      value: duration(m.medianTimeToFillEmergencyMins),
      sub: "Emergency requests, post → booking",
      accent: "scheduled" as const,
    },
    {
      label: "Show-up rate",
      value: pct(m.showUpRate),
      sub: "Confirmed bookings that checked in",
      accent: "verified" as const,
    },
    {
      label: "30-day rebooking",
      value: pct(m.rebookingRate30d),
      sub: `${m.rebookingBase.rebooked} of ${m.rebookingBase.eligible} eligible churches`,
      accent: "gold" as const,
    },
  ];

  const accentBar: Record<string, string> = {
    clay: "bg-clay",
    scheduled: "bg-scheduled",
    verified: "bg-verified",
    gold: "bg-gold",
  };

  return (
    <div>
      <h2 className="font-display text-xl font-semibold">Pilot KPIs</h2>
      <p className="mt-1 text-sm text-ink-soft">Live from the marketplace. &ldquo;—&rdquo; means not enough data yet.</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="relative overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface p-5 shadow-[var(--shadow-sm)]"
          >
            <span className={`absolute inset-y-0 left-0 w-1.5 ${accentBar[k.accent]}`} />
            <p className="eyebrow">{k.label}</p>
            <p className="mt-1 font-display text-4xl font-semibold tabular-nums">{k.value}</p>
            <p className="mt-1 text-sm text-ink-soft">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-[var(--radius-lg)] border border-line bg-surface p-5 shadow-[var(--shadow-sm)]">
        <p className="eyebrow">Requests</p>
        <div className="mt-2 flex gap-8">
          <div>
            <p className="font-display text-2xl font-semibold tabular-nums">{m.requests.total}</p>
            <p className="text-sm text-ink-soft">posted</p>
          </div>
          <div>
            <p className="font-display text-2xl font-semibold tabular-nums">{m.requests.booked}</p>
            <p className="text-sm text-ink-soft">booked</p>
          </div>
        </div>
      </div>
    </div>
  );
}

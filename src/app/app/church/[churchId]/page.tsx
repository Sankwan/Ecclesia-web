import Link from "next/link";
import { serverApiFetch } from "@/lib/api-server";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { statusMeta } from "@/lib/status";
import { skillPhoto } from "@/lib/images";
import type { Church, ServiceRequest } from "@/lib/types";

type ChurchRequest = ServiceRequest & {
  _count: { applications: number };
  booking: { id: string; status: string } | null;
};

export default async function ChurchDetailPage({
  params,
}: {
  params: Promise<{ churchId: string }>;
}) {
  const { churchId } = await params;
  const [church, requests] = await Promise.all([
    serverApiFetch<Church>(`/churches/${churchId}`),
    serverApiFetch<ChurchRequest[]>(`/churches/${churchId}/requests`),
  ]);

  const openCount = requests.filter((r) => r.status === "OPEN").length;

  return (
    <div>
      {/* Calm dashboard header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-semibold">{church.name}</h1>
            {church.isVerified && <Chip tone="blue">Verified</Chip>}
          </div>
          <p className="mt-1 text-ink-soft">{church.areaLabel}</p>
        </div>
        <Link href={`/app/church/${churchId}/requests/new`}>
          <Button>+ New request</Button>
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 sm:max-w-md">
        <Stat label="Open" value={openCount} />
        <Stat label="Bookings" value={church._count?.bookings ?? 0} />
        <Stat label="SMS credits" value={church.smsBalance} />
      </div>

      <h2 className="mt-10 font-display text-xl font-semibold">Requests</h2>
      {requests.length === 0 ? (
        <div className="mt-4 rounded-[var(--radius-lg)] border border-dashed border-line bg-surface p-8 text-center">
          <p className="text-ink-soft">No requests yet.</p>
          <Link href={`/app/church/${churchId}/requests/new`} className="mt-2 inline-block font-semibold text-clay">
            Post your first one →
          </Link>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {requests.map((r) => {
            const status = statusMeta(r.status);
            const urgency = statusMeta(r.urgency);
            return (
              <Link key={r.id} href={`/app/church/${churchId}/requests/${r.id}`} className="group block">
                <article className="card-lift flex items-stretch gap-4 overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface pr-4 shadow-[var(--shadow-card)]">
                  <div className="relative w-24 shrink-0 overflow-hidden sm:w-32">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={skillPhoto(r.skill?.slug, 300)}
                      alt={r.skill?.name ?? ""}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex flex-1 flex-wrap items-center justify-between gap-3 py-4">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Chip tone={urgency.tone}>{urgency.label}</Chip>
                        <Chip tone={status.tone}>{status.label}</Chip>
                      </div>
                      <p className="mt-2 font-display text-lg font-semibold leading-tight">{r.skill?.name}</p>
                      <p className="text-sm text-ink-soft">
                        {new Date(r.serviceDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} at{" "}
                        {r.startTime} · GHS {r.budgetMinGhs}–{r.budgetMaxGhs}
                      </p>
                    </div>
                    <p className="font-data text-sm text-ink-soft">
                      {r._count.applications} application{r._count.applications === 1 ? "" : "s"}
                    </p>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[var(--radius)] border border-line bg-surface p-3.5 shadow-[var(--shadow-sm)]">
      <p className="font-display text-2xl font-semibold tabular-nums">{value}</p>
      <p className="eyebrow mt-0.5">{label}</p>
    </div>
  );
}

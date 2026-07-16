import Link from "next/link";
import { serverApiFetch } from "@/lib/api-server";
import { Chip } from "@/components/ui/chip";
import { statusMeta } from "@/lib/status";
import { skillPhoto } from "@/lib/images";
import type { ServiceRequest } from "@/lib/types";

type ChurchRequest = ServiceRequest & {
  _count: { applications: number };
  booking: { id: string; status: string } | null;
};

export default async function ChurchRequestsPage({
  params,
}: {
  params: Promise<{ churchId: string }>;
}) {
  const { churchId } = await params;
  const requests = await serverApiFetch<ChurchRequest[]>(`/churches/${churchId}/requests`);

  if (requests.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-dashed border-line bg-surface p-8 text-center">
        <p className="text-ink-soft">No requests yet.</p>
        <Link href={`/app/church/${churchId}/requests/new`} className="mt-2 inline-block font-semibold text-clay">
          Post your first one →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
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
  );
}

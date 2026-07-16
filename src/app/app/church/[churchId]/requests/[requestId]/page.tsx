import { serverApiFetch } from "@/lib/api-server";
import { Chip } from "@/components/ui/chip";
import { Avatar } from "@/components/ui/avatar";
import { statusMeta } from "@/lib/status";
import { skillPhoto } from "@/lib/images";
import { AcceptApplicationButton } from "@/components/accept-application-button";
import { CancelRequestButton } from "@/components/cancel-request-button";
import type { ServiceRequest } from "@/lib/types";

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ churchId: string; requestId: string }>;
}) {
  const { requestId } = await params;
  const request = await serverApiFetch<ServiceRequest>(`/requests/${requestId}`);
  const urgency = statusMeta(request.urgency);
  const status = statusMeta(request.status);
  const applications = request.applications ?? [];

  return (
    <div className="max-w-3xl">
      {/* Request hero */}
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface shadow-[var(--shadow-card)]">
        <div className="relative aspect-[16/6] w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={skillPhoto(request.skill?.slug, 900)}
            alt={request.skill?.name ?? ""}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
            <div>
              <div className="mb-2 flex gap-1.5">
                <Chip tone={urgency.tone} className="bg-white/90 dark:bg-black/60">
                  {urgency.label}
                </Chip>
                <Chip tone={status.tone} className="bg-white/90 dark:bg-black/60">
                  {status.label}
                </Chip>
              </div>
              <h1 className="font-display text-3xl font-semibold text-white">{request.skill?.name}</h1>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <p className="text-ink-soft">
              {new Date(request.serviceDate).toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}{" "}
              at {request.startTime} · {request.areaLabel}
            </p>
            <p className="mt-1 font-data font-semibold">
              Budget GHS {request.budgetMinGhs}–{request.budgetMaxGhs}
            </p>
            {request.rehearsalNote && <p className="mt-2 text-sm text-ink-soft">Rehearsal: {request.rehearsalNote}</p>}
            {request.notes && <p className="mt-1 text-sm text-ink-soft">{request.notes}</p>}
          </div>
          {request.status === "OPEN" && <CancelRequestButton requestId={request.id} />}
        </div>
      </div>

      <h2 className="mt-10 font-display text-xl font-semibold">
        Applications {applications.length > 0 && <span className="text-ink-faint">({applications.length})</span>}
      </h2>
      {applications.length === 0 ? (
        <p className="mt-3 text-ink-soft">
          No applications yet — providers within range have been notified and can apply any time.
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {applications.map((app) => {
            const appStatus = statusMeta(app.status);
            const rating =
              app.provider && app.provider.ratingCount > 0
                ? Math.round((app.provider.ratingSum / app.provider.ratingCount) * 10) / 10
                : null;
            return (
              <div
                key={app.id}
                className="flex flex-wrap items-start justify-between gap-4 rounded-[var(--radius-lg)] border border-line bg-surface p-4 shadow-[var(--shadow-sm)]"
              >
                <div className="flex gap-3">
                  <Avatar name={app.provider?.displayName ?? "?"} size={48} />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-display text-lg font-semibold leading-tight">{app.provider?.displayName}</p>
                      <Chip tone={appStatus.tone}>{appStatus.label}</Chip>
                    </div>
                    <p className="mt-0.5 text-sm text-ink-soft">
                      {app.provider?.areaLabel} · {statusMeta(app.provider?.verification ?? "UNVERIFIED").label}
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-sm text-ink-soft">
                      {rating && (
                        <span className="text-gold">
                          ★ {rating} <span className="text-ink-faint">({app.provider?.ratingCount})</span>
                        </span>
                      )}
                      <span>{app.provider?.completedCount} completed</span>
                    </p>
                    {app.message && <p className="mt-2 text-sm text-ink">{app.message}</p>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="font-data text-lg font-semibold">GHS {app.offerGhs}</p>
                  {app.status === "PENDING" && request.status === "OPEN" && (
                    <AcceptApplicationButton applicationId={app.id} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { serverApiFetch } from "@/lib/api-server";
import { Chip } from "@/components/ui/chip";
import { statusMeta } from "@/lib/status";
import { skillPhoto } from "@/lib/images";
import { ApplyForm } from "@/components/forms/apply-form";
import type { ServiceRequest } from "@/lib/types";

export default async function ProviderRequestDetailPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = await params;
  const request = await serverApiFetch<ServiceRequest>(`/requests/${requestId}`);
  const urgency = statusMeta(request.urgency);
  const status = statusMeta(request.status);

  return (
    <div className="max-w-xl">
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface shadow-[var(--shadow-card)]">
        <div className="relative aspect-[16/7] w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={skillPhoto(request.skill?.slug, 800)}
            alt={request.skill?.name ?? ""}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
          <div className="absolute bottom-4 left-5 right-5">
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
        <div className="p-5">
          <p className="text-ink-soft">
            {request.church?.name} · {request.areaLabel}
          </p>
          <p className="mt-1 text-ink-soft">
            {new Date(request.serviceDate).toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}{" "}
            at {request.startTime} · {request.durationMins} mins
          </p>
          <p className="mt-2 font-data font-semibold">
            Budget: GHS {request.budgetMinGhs}–{request.budgetMaxGhs}
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            Equipment {request.equipmentProvided ? "provided" : "not provided"}
          </p>
          {request.rehearsalNote && <p className="mt-2 text-sm text-ink-soft">Rehearsal: {request.rehearsalNote}</p>}
          {request.notes && <p className="mt-1 text-sm text-ink-soft">{request.notes}</p>}
        </div>
      </div>

      {request.myApplication ? (
        <div className="mt-6 rounded-[var(--radius-lg)] border border-line bg-surface p-4 shadow-[var(--shadow-sm)]">
          <p className="eyebrow">Your application</p>
          <div className="mt-1.5 flex items-center gap-2">
            {(() => {
              const appStatus = statusMeta(request.myApplication.status);
              return <Chip tone={appStatus.tone}>{appStatus.label}</Chip>;
            })()}
            <span className="font-data text-sm font-semibold">GHS {request.myApplication.offerGhs}</span>
          </div>
        </div>
      ) : request.status === "OPEN" ? (
        <ApplyForm requestId={request.id} suggestedMin={request.budgetMinGhs} suggestedMax={request.budgetMaxGhs} />
      ) : (
        <p className="mt-6 text-ink-soft">This request is no longer open.</p>
      )}
    </div>
  );
}

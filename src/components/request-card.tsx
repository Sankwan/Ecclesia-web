import Link from "next/link";
import { Chip } from "@/components/ui/chip";
import { statusMeta } from "@/lib/status";
import { skillPhoto } from "@/lib/images";
import type { ServiceRequest } from "@/lib/types";

// Airbnb-style image-led listing card for an open request.
export function RequestCard({
  request,
  href,
  meta,
}: {
  request: ServiceRequest & { distanceKm?: number };
  href: string;
  meta?: string;
}) {
  const urgency = statusMeta(request.urgency);
  const date = new Date(request.serviceDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  return (
    <Link href={href} className="group block">
      <article className="card-lift overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface shadow-[var(--shadow-card)]">
        <div className="relative aspect-[16/7] w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={skillPhoto(request.skill?.slug, 700)}
            alt={request.skill?.name ?? "Request"}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute left-3 top-3">
            <Chip tone={urgency.tone} className="bg-white/90 backdrop-blur dark:bg-black/60">
              {urgency.label}
            </Chip>
          </div>
        </div>
        <div className="flex items-start justify-between gap-3 p-4">
          <div>
            <h3 className="font-display text-lg font-semibold leading-tight">{request.skill?.name}</h3>
            <p className="mt-1 text-sm text-ink-soft">
              {request.church?.name ? `${request.church.name} · ` : ""}
              {request.areaLabel} · {date} at {request.startTime}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-data text-sm font-semibold text-ink">
              GHS {request.budgetMinGhs}–{request.budgetMaxGhs}
            </p>
            {typeof request.distanceKm === "number" && (
              <p className="font-data text-xs text-ink-faint">{Math.round(request.distanceKm)} km away</p>
            )}
            {meta && <p className="text-xs text-ink-faint">{meta}</p>}
          </div>
        </div>
      </article>
    </Link>
  );
}

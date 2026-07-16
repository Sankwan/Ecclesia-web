import { serverApiFetch } from "@/lib/api-server";
import { getSession } from "@/lib/session";
import { Chip } from "@/components/ui/chip";
import { Avatar } from "@/components/ui/avatar";
import { statusMeta } from "@/lib/status";
import { skillPhoto } from "@/lib/images";
import { BookingActions } from "@/components/booking-actions";
import type { Booking } from "@/lib/types";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  const [booking, session] = await Promise.all([
    serverApiFetch<Booking>(`/bookings/${bookingId}`),
    getSession(),
  ]);
  const side = session?.role === "PROVIDER" ? "provider" : "church";
  const status = statusMeta(booking.status);

  return (
    <div className="max-w-2xl">
      {/* Booking hero */}
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface shadow-[var(--shadow-card)]">
        <div className="relative aspect-[16/6] w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={skillPhoto(booking.skill.slug, 900)}
            alt={booking.skill.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
          <div className="absolute bottom-4 left-5 right-5">
            <Chip tone={status.tone} className="mb-2 bg-white/90 dark:bg-black/60">
              {status.label}
            </Chip>
            <h1 className="font-display text-3xl font-semibold text-white">{booking.skill.name}</h1>
          </div>
        </div>
        <div className="p-5">
          <p className="text-ink-soft">
            {new Date(booking.serviceDate).toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}{" "}
            at {booking.startTime} · {booking.durationMins} mins
          </p>
          <p className="mt-1 font-data font-semibold">Agreed: GHS {booking.agreedGhs}</p>
          {booking.checkInCode && booking.status === "CONFIRMED" && side === "church" && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-[var(--radius)] bg-clay-tint px-3 py-2">
              <span className="text-sm text-ink-soft">Give the provider this code at the venue:</span>
              <strong className="font-data text-lg tracking-widest text-clay">{booking.checkInCode}</strong>
            </div>
          )}
          {booking.rehearsalNote && <p className="mt-2 text-sm text-ink-soft">Rehearsal: {booking.rehearsalNote}</p>}
          {booking.notes && <p className="mt-1 text-sm text-ink-soft">{booking.notes}</p>}
          {booking.cancelReason && (
            <p className="mt-2 text-sm font-semibold text-emergency">Cancelled: {booking.cancelReason}</p>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-[var(--radius-lg)] border border-line bg-surface p-4 shadow-[var(--shadow-sm)]">
          <p className="eyebrow">Church</p>
          <div className="mt-2 flex items-center gap-3">
            <Avatar name={booking.church.name} size={40} />
            <div>
              <p className="font-semibold">{booking.church.name}</p>
              <p className="text-sm text-ink-soft">{booking.church.addressDetail ?? booking.church.areaLabel}</p>
            </div>
          </div>
          <p className="mt-3 font-data text-sm">{booking.church.contactPhone ?? booking.church.phone}</p>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-line bg-surface p-4 shadow-[var(--shadow-sm)]">
          <p className="eyebrow">Provider</p>
          <div className="mt-2 flex items-center gap-3">
            <Avatar name={booking.provider.displayName} size={40} />
            <div>
              <p className="font-semibold">{booking.provider.displayName}</p>
              <p className="text-sm text-ink-soft">{booking.provider.fullName}</p>
            </div>
          </div>
          <p className="mt-3 font-data text-sm">{booking.provider.phone}</p>
        </div>
      </div>

      {booking.reviews.length > 0 && (
        <div className="mt-6">
          <p className="eyebrow">Reviews</p>
          <div className="mt-2 flex flex-col gap-2">
            {booking.reviews.map((r, i) => (
              <p key={i} className="text-sm">
                <span className="font-data font-semibold text-gold">{"★".repeat(r.rating)}</span>{" "}
                <span className="text-ink-faint">({r.authorSide})</span> {r.comment}
              </p>
            ))}
          </div>
        </div>
      )}

      <BookingActions booking={booking} side={side} />
    </div>
  );
}

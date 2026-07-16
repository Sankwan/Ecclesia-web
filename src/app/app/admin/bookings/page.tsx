import { serverApiFetch } from "@/lib/api-server";
import { BookingsOversight } from "@/components/admin/bookings-oversight";
import type { AdminBooking } from "@/lib/types";

export default async function AdminBookingsPage() {
  const bookings = await serverApiFetch<AdminBooking[]>("/admin/bookings");
  return (
    <div>
      <h2 className="font-display text-xl font-semibold">Bookings</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Oversight for mediation — disputes and no-shows first, with both parties&apos; contact.
      </p>
      <div className="mt-5">
        <BookingsOversight bookings={bookings} />
      </div>
    </div>
  );
}

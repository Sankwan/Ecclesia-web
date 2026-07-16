import { serverApiFetch } from "@/lib/api-server";
import { VerificationCard } from "@/components/admin/verification-card";
import type { VerificationRecord } from "@/lib/types";

export default async function VerificationsPage() {
  const pending = await serverApiFetch<VerificationRecord[]>("/admin/verifications?status=pending");

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-xl font-semibold">Provider verifications</h2>
        <span className="text-sm text-ink-faint">{pending.length} awaiting review</span>
      </div>

      {pending.length === 0 ? (
        <div className="mt-4 rounded-[var(--radius-lg)] border border-dashed border-line bg-surface p-8 text-center text-ink-soft">
          Queue is clear — nothing awaiting review.
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {pending.map((r) => (
            <VerificationCard key={r.id} record={r} />
          ))}
        </div>
      )}
    </div>
  );
}

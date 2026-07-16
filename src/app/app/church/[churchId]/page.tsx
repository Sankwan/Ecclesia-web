import Link from "next/link";
import { serverApiFetch } from "@/lib/api-server";
import { Chip } from "@/components/ui/chip";
import { Avatar } from "@/components/ui/avatar";
import { statusMeta } from "@/lib/status";
import type { Church, ChurchMember, ServiceRequest } from "@/lib/types";

type ChurchRequest = ServiceRequest & { _count: { applications: number } };

export default async function ChurchOverviewPage({
  params,
}: {
  params: Promise<{ churchId: string }>;
}) {
  const { churchId } = await params;
  const [church, birthdays, requests] = await Promise.all([
    serverApiFetch<Church>(`/churches/${churchId}`),
    serverApiFetch<ChurchMember[]>(`/churches/${churchId}/birthdays/today`),
    serverApiFetch<ChurchRequest[]>(`/churches/${churchId}/requests`),
  ]);

  const openRequests = requests.filter((r) => r.status === "OPEN");
  const recent = requests.slice(0, 3);

  return (
    <div className="flex flex-col gap-8">
      {/* Stat row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Members" value={church._count?.members ?? 0} href={`/app/church/${churchId}/members`} />
        <Stat label="Open requests" value={openRequests.length} href={`/app/church/${churchId}/requests`} />
        <Stat label="Bookings" value={church._count?.bookings ?? 0} />
        <Stat label="SMS credits" value={church.smsBalance} href={`/app/church/${churchId}/messages`} />
      </div>

      {/* Birthdays today — the retention hook, front and centre */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Birthdays today</h2>
          <Link href={`/app/church/${churchId}/messages`} className="text-sm font-semibold text-clay">
            Message settings →
          </Link>
        </div>
        {birthdays.length === 0 ? (
          <p className="mt-3 text-ink-soft">No birthdays today.</p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {birthdays.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-line bg-surface p-4 shadow-[var(--shadow-sm)]"
              >
                <Avatar name={m.fullName} size={44} />
                <div className="min-w-0">
                  <p className="truncate font-semibold">🎂 {m.fullName}</p>
                  <p className="text-sm text-ink-soft">
                    {m.group ?? "Member"}
                    {m.phone ? "" : " · no phone"}
                    {m.phone && !m.smsConsent ? " · SMS off" : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        {church.birthdaySettings?.enabled === false && birthdays.some((m) => m.phone && m.smsConsent) && (
          <p className="mt-3 text-sm text-ink-soft">
            Automatic birthday SMS is <strong>off</strong>. Turn it on in{" "}
            <Link href={`/app/church/${churchId}/messages`} className="font-semibold text-clay underline underline-offset-2">
              Messages
            </Link>
            .
          </p>
        )}
      </section>

      {/* Recent requests */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Recent requests</h2>
          <Link href={`/app/church/${churchId}/requests`} className="text-sm font-semibold text-clay">
            View all →
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="mt-3 text-ink-soft">
            No requests yet.{" "}
            <Link href={`/app/church/${churchId}/requests/new`} className="font-semibold text-clay">
              Post one →
            </Link>
          </p>
        ) : (
          <div className="mt-4 flex flex-col gap-2">
            {recent.map((r) => {
              const status = statusMeta(r.status);
              return (
                <Link
                  key={r.id}
                  href={`/app/church/${churchId}/requests/${r.id}`}
                  className="flex items-center justify-between gap-3 rounded-[var(--radius)] border border-line bg-surface px-4 py-3 shadow-[var(--shadow-sm)] transition-colors hover:bg-surface-sunken"
                >
                  <div className="flex items-center gap-2">
                    <Chip tone={status.tone}>{status.label}</Chip>
                    <span className="font-semibold">{r.skill?.name}</span>
                    <span className="text-sm text-ink-soft">
                      {new Date(r.serviceDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                  <span className="font-data text-sm text-ink-soft">
                    {r._count.applications} applied
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, href }: { label: string; value: number; href?: string }) {
  const inner = (
    <>
      <p className="font-display text-2xl font-semibold tabular-nums">{value}</p>
      <p className="eyebrow mt-0.5">{label}</p>
    </>
  );
  const cls = "block rounded-[var(--radius)] border border-line bg-surface p-3.5 shadow-[var(--shadow-sm)]";
  return href ? (
    <Link href={href} className={`${cls} transition-colors hover:bg-surface-sunken`}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

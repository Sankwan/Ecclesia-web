import Link from "next/link";
import { serverApiFetch } from "@/lib/api-server";
import { Chip } from "@/components/ui/chip";
import { Contact } from "@/components/admin/contact";
import { statusMeta } from "@/lib/status";
import type { Worklist } from "@/lib/types";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

export default async function WorklistPage() {
  const w = await serverApiFetch<Worklist>("/admin/worklist");

  const totalActions =
    w.supplyGaps.length + w.atRisk.length + w.disputes.length + w.topupRequests.length + w.pendingVerifications;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-display text-xl font-semibold">What needs you</h2>
        {totalActions === 0 ? (
          <Chip tone="green">All clear</Chip>
        ) : (
          <Chip tone="gold">{totalActions} open item{totalActions === 1 ? "" : "s"}</Chip>
        )}
      </div>

      {totalActions === 0 && (
        <p className="text-ink-soft">
          Nothing needs attention right now — no supply gaps, stalled emergencies, disputes, or top-up requests.
        </p>
      )}

      {/* Supply gaps — nobody to notify, manual sourcing needed */}
      {w.supplyGaps.length > 0 && (
        <Section
          title="Supply gaps"
          hint="No provider matched — source someone manually and phone the church."
          tone="red"
        >
          {w.supplyGaps.map((r) => (
            <Row key={r.id}>
              <div>
                <p className="font-semibold">
                  {r.skill} · {r.areaLabel}
                </p>
                <p className="text-sm text-ink-soft">
                  {r.church.name} · {fmtDate(r.serviceDate)} at {r.startTime}
                </p>
              </div>
              <Contact name={r.church.name} phone={r.church.phone} />
            </Row>
          ))}
        </Section>
      )}

      {/* At-risk emergencies — notified but no applications */}
      {w.atRisk.length > 0 && (
        <Section
          title="Stalled emergencies"
          hint="Providers were notified but nobody has applied yet."
          tone="gold"
        >
          {w.atRisk.map((r) => (
            <Row key={r.id}>
              <div>
                <p className="font-semibold">
                  {r.skill} · {r.areaLabel}
                </p>
                <p className="text-sm text-ink-soft">
                  {r.church.name} · {fmtDate(r.serviceDate)} at {r.startTime}
                </p>
              </div>
              <Contact name={r.church.name} phone={r.church.phone} />
            </Row>
          ))}
        </Section>
      )}

      {/* Top-up requests */}
      {w.topupRequests.length > 0 && (
        <Section title="Top-up requests" hint="Verify MoMo, then credit from the Churches tab." tone="gold">
          {w.topupRequests.map((t) => (
            <Row key={t.id}>
              <p className="text-sm">{t.body}</p>
              <Link href="/app/admin/churches" className="shrink-0 text-sm font-semibold text-clay">
                Go credit →
              </Link>
            </Row>
          ))}
        </Section>
      )}

      {/* Disputes / no-shows */}
      {w.disputes.length > 0 && (
        <Section title="Disputes & no-shows" hint="Reach both parties to mediate." tone="red">
          {w.disputes.map((b) => {
            const s = statusMeta(b.status);
            return (
              <Row key={b.id}>
                <div>
                  <div className="flex items-center gap-2">
                    <Chip tone={s.tone}>{s.label}</Chip>
                    <span className="font-semibold">{b.skill}</span>
                    <span className="text-sm text-ink-soft">{fmtDate(b.serviceDate)}</span>
                  </div>
                  <div className="mt-1.5 flex flex-col gap-1">
                    <Contact label="Church:" name={b.church.name} phone={b.church.phone} />
                    <Contact label="Provider:" name={b.provider.displayName} phone={b.provider.phone} />
                  </div>
                </div>
              </Row>
            );
          })}
        </Section>
      )}

      {/* Recent provider cancellations */}
      {w.recentCancellations.length > 0 && (
        <Section title="Recent provider cancellations" hint="Last 7 days — coach or flag repeat offenders.">
          {w.recentCancellations.map((b) => (
            <Row key={b.id}>
              <div>
                <p className="font-semibold">
                  {b.provider.displayName} cancelled {b.skill}
                </p>
                <p className="text-sm text-ink-soft">
                  {b.churchName} · {fmtDate(b.serviceDate)}
                  {b.cancelReason ? ` · "${b.cancelReason}"` : ""}
                </p>
              </div>
              <Contact name={b.provider.displayName} phone={b.provider.phone} />
            </Row>
          ))}
        </Section>
      )}

      {/* Pending verifications pointer */}
      {w.pendingVerifications > 0 && (
        <Link
          href="/app/admin/verifications"
          className="flex items-center justify-between rounded-[var(--radius-lg)] border border-line bg-surface p-4 shadow-[var(--shadow-sm)] hover:bg-surface-sunken"
        >
          <span className="font-semibold">
            {w.pendingVerifications} provider verification{w.pendingVerifications === 1 ? "" : "s"} awaiting review
          </span>
          <span className="font-semibold text-clay">Review →</span>
        </Link>
      )}
    </div>
  );
}

function Section({
  title,
  hint,
  tone,
  children,
}: {
  title: string;
  hint: string;
  tone?: "red" | "gold";
  children: React.ReactNode;
}) {
  const bar = tone === "red" ? "bg-emergency" : tone === "gold" ? "bg-gold" : "bg-line";
  return (
    <section>
      <div className="flex items-center gap-2">
        <span className={`h-4 w-1.5 rounded-full ${bar}`} />
        <h3 className="font-display text-lg font-semibold">{title}</h3>
      </div>
      <p className="mt-0.5 pl-3.5 text-sm text-ink-soft">{hint}</p>
      <div className="mt-3 flex flex-col gap-2">{children}</div>
    </section>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 rounded-[var(--radius-lg)] border border-line bg-surface p-4 shadow-[var(--shadow-sm)]">
      {children}
    </div>
  );
}

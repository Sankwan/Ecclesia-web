import { serverApiFetch } from "@/lib/api-server";
import { Chip } from "@/components/ui/chip";
import { TopupPanel } from "@/components/messages/topup-panel";
import { BirthdayAutomation } from "@/components/messages/birthday-automation";
import { CampaignComposer } from "@/components/messages/campaign-composer";
import type { Church, ChurchMember } from "@/lib/types";

interface CampaignSummary {
  id: string;
  kind: string;
  template: string;
  createdAt: string;
  recipients: number;
  creditsUsed: number;
  sent: number;
  delivered: number;
  failed: number;
  queued: number;
}

export default async function MessagesPage({
  params,
}: {
  params: Promise<{ churchId: string }>;
}) {
  const { churchId } = await params;
  const [church, membersData, campaigns] = await Promise.all([
    serverApiFetch<Church>(`/churches/${churchId}`),
    serverApiFetch<{ items: ChurchMember[] }>(`/churches/${churchId}/members?limit=50`),
    serverApiFetch<CampaignSummary[]>(`/churches/${churchId}/sms/campaigns`),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <TopupPanel churchId={churchId} balance={church.smsBalance} />
      <BirthdayAutomation churchId={churchId} settings={church.birthdaySettings} />
      <CampaignComposer
        churchId={churchId}
        churchName={church.name}
        members={membersData.items}
        balance={church.smsBalance}
      />

      <section>
        <h3 className="font-display text-lg font-semibold">Recent messages</h3>
        {campaigns.length === 0 ? (
          <p className="mt-3 text-ink-soft">No messages sent yet.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {campaigns.map((c) => (
              <div
                key={c.id}
                className="rounded-[var(--radius-lg)] border border-line bg-surface p-4 shadow-[var(--shadow-sm)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="line-clamp-2 flex-1 text-sm">{c.template}</p>
                  {c.kind === "birthday_auto" && <Chip tone="gold">Birthday</Chip>}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-soft">
                  <span className="font-data">
                    {new Date(c.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </span>
                  <span>{c.recipients} recipients</span>
                  <span>{c.creditsUsed} credits</span>
                  {c.delivered > 0 && <span className="text-verified">{c.delivered} delivered</span>}
                  {c.sent > 0 && <span>{c.sent} sent</span>}
                  {c.queued > 0 && <span className="text-gold">{c.queued} queued</span>}
                  {c.failed > 0 && <span className="text-emergency">{c.failed} failed</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

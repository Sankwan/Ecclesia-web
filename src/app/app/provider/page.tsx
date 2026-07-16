import Link from "next/link";
import { serverApiFetch, ServerApiError } from "@/lib/api-server";
import { CreateProviderForm } from "@/components/forms/create-provider-form";
import { AvailabilityToggle } from "@/components/availability-toggle";
import { RequestCard } from "@/components/request-card";
import { Avatar } from "@/components/ui/avatar";
import { Chip } from "@/components/ui/chip";
import { statusMeta } from "@/lib/status";
import type { ProviderProfile, ServiceRequest, Skill } from "@/lib/types";

export default async function ProviderFeedPage() {
  let profile: ProviderProfile;
  try {
    profile = await serverApiFetch<ProviderProfile>("/providers/me");
  } catch (e) {
    if (e instanceof ServerApiError && e.status === 404) {
      const skills = await serverApiFetch<Skill[]>("/skills");
      return (
        <div>
          <h1 className="font-display text-3xl font-semibold">Welcome</h1>
          <p className="mt-1 text-ink-soft">Set up your profile to start seeing open requests.</p>
          <div className="mt-6">
            <CreateProviderForm skills={skills} />
          </div>
        </div>
      );
    }
    throw e;
  }

  const feed = await serverApiFetch<{ items: Array<ServiceRequest & { distanceKm: number }> }>("/requests/feed");
  const verification = statusMeta(profile.verification);

  return (
    <div>
      {/* Profile header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar name={profile.displayName} size={56} />
          <div>
            <h1 className="font-display text-2xl font-semibold leading-tight">{profile.displayName}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <Chip tone={verification.tone}>{verification.label}</Chip>
              {profile.skills.map((s) => (
                <Chip key={s.skillId} tone="neutral" dotless>
                  {s.skill.name}
                </Chip>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="eyebrow">Your availability</span>
          <AvailabilityToggle current={profile.availability} />
        </div>
      </div>

      {profile.verification === "UNVERIFIED" && (
        <div className="mt-6 flex items-start gap-3 rounded-[var(--radius-lg)] border border-clay/30 bg-clay-tint p-4">
          <div>
            <p className="font-semibold text-clay">Get verified to apply for requests</p>
            <p className="mt-1 text-sm text-ink-soft">
              Submit your ID from your{" "}
              <Link href="/app/provider/profile" className="font-semibold text-clay underline underline-offset-2">
                profile page
              </Link>
              . Churches only book verified providers.
            </p>
          </div>
        </div>
      )}

      <h2 className="mt-10 font-display text-xl font-semibold">Open requests near you</h2>
      {feed.items.length === 0 ? (
        <p className="mt-3 text-ink-soft">Nothing matches your skills and radius right now. Check back soon.</p>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {feed.items.map((r) => (
            <RequestCard key={r.id} request={r} href={`/app/provider/requests/${r.id}`} />
          ))}
        </div>
      )}
    </div>
  );
}

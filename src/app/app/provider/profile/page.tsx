import Link from "next/link";
import { serverApiFetch } from "@/lib/api-server";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { statusMeta } from "@/lib/status";
import { AvailabilityToggle } from "@/components/availability-toggle";
import { EditSkillsForm } from "@/components/forms/edit-skills-form";
import { SubmitVerificationForm } from "@/components/forms/submit-verification-form";
import type { Application, BookingStatus, ProviderProfile, Skill } from "@/lib/types";

interface BookingListItem {
  id: string;
  status: BookingStatus;
  agreedGhs: number;
  request: { skill: Skill; serviceDate: string; startTime: string };
  church: { name: string; areaLabel: string };
}

export default async function ProviderProfilePage() {
  const [profile, skills, applications, bookings] = await Promise.all([
    serverApiFetch<ProviderProfile>("/providers/me"),
    serverApiFetch<Skill[]>("/skills"),
    serverApiFetch<Array<Application & { request: { skill: Skill; church: { name: string; areaLabel: string } } }>>(
      "/providers/me/applications",
    ),
    serverApiFetch<BookingListItem[]>("/providers/me/bookings"),
  ]);
  const verification = statusMeta(profile.verification);

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-bold">{profile.displayName}</h1>
      <p className="mt-1 text-ink-soft">{profile.areaLabel}</p>

      <Card className="mt-6">
        <p className="eyebrow">Availability</p>
        <div className="mt-2">
          <AvailabilityToggle current={profile.availability} />
        </div>
      </Card>

      <Card className="mt-4">
        <p className="eyebrow">Skills</p>
        <div className="mt-2">
          <EditSkillsForm profile={profile} skills={skills} />
        </div>
      </Card>

      <Card className="mt-4">
        <div className="flex items-center gap-2">
          <p className="eyebrow">Verification</p>
          <Chip tone={verification.tone} solid={verification.solid}>
            {verification.label}
          </Chip>
        </div>
        {profile.verification === "UNVERIFIED" && <SubmitVerificationForm />}
      </Card>

      <h2 className="mt-10 font-display text-lg font-bold">My applications</h2>
      {applications.length === 0 ? (
        <p className="mt-3 text-ink-soft">You haven&apos;t applied to anything yet.</p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {applications.map((a) => {
            const s = statusMeta(a.status);
            const href = a.booking ? `/app/bookings/${a.booking.id}` : `/app/provider/requests/${a.requestId}`;
            return (
              <Link key={a.id} href={href}>
                <Card className="hover:bg-surface-sunken">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Chip tone={s.tone} solid={s.solid}>
                          {s.label}
                        </Chip>
                        <p className="font-display font-bold">{a.request.skill.name}</p>
                      </div>
                      <p className="mt-1 text-sm text-ink-soft">
                        {a.request.church.name} · {a.request.church.areaLabel}
                      </p>
                    </div>
                    <p className="font-data text-sm font-semibold">GHS {a.offerGhs}</p>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      <h2 className="mt-10 font-display text-lg font-bold">My bookings</h2>
      {bookings.length === 0 ? (
        <p className="mt-3 text-ink-soft">No bookings yet.</p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {bookings.map((b) => {
            const s = statusMeta(b.status);
            return (
              <Link key={b.id} href={`/app/bookings/${b.id}`}>
                <Card className="hover:bg-surface-sunken">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Chip tone={s.tone} solid={s.solid}>
                          {s.label}
                        </Chip>
                        <p className="font-display font-bold">{b.request.skill.name}</p>
                      </div>
                      <p className="mt-1 text-sm text-ink-soft">
                        {new Date(b.request.serviceDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} at{" "}
                        {b.request.startTime}
                      </p>
                    </div>
                    <p className="font-data text-sm font-semibold">GHS {b.agreedGhs}</p>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

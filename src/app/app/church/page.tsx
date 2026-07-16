import Link from "next/link";
import { serverApiFetch } from "@/lib/api-server";
import { CreateChurchForm } from "@/components/forms/create-church-form";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import type { Church } from "@/lib/types";

export default async function ChurchListPage() {
  const churches = await serverApiFetch<Church[]>("/churches/mine");

  if (churches.length === 0) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold">Welcome</h1>
        <p className="mt-1 text-ink-soft">You don&apos;t administer a church yet.</p>
        <div className="mt-6">
          <CreateChurchForm />
        </div>
      </div>
    );
  }

  if (churches.length === 1) {
    const { redirect } = await import("next/navigation");
    redirect(`/app/church/${churches[0].id}`);
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Your churches</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {churches.map((c) => (
          <Link key={c.id} href={`/app/church/${c.id}`}>
            <Card className="hover:bg-surface-sunken">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-display font-bold">{c.name}</h2>
                {c.isVerified && <Chip tone="blue" solid>Verified</Chip>}
              </div>
              <p className="mt-1 text-sm text-ink-soft">{c.areaLabel}</p>
              <p className="mt-3 font-data text-xs text-ink-soft">
                {c._count?.requests ?? 0} requests · {c._count?.bookings ?? 0} bookings
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

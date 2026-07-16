import Link from "next/link";
import { serverApiFetch } from "@/lib/api-server";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { ChurchTabs } from "@/components/church-tabs";
import type { Church } from "@/lib/types";

export default async function ChurchLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ churchId: string }>;
}) {
  const { churchId } = await params;
  const church = await serverApiFetch<Church>(`/churches/${churchId}`);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-semibold">{church.name}</h1>
            {church.isVerified && <Chip tone="blue">Verified</Chip>}
          </div>
          <p className="mt-1 text-ink-soft">{church.areaLabel}</p>
        </div>
        <Link href={`/app/church/${churchId}/requests/new`}>
          <Button>+ New request</Button>
        </Link>
      </div>

      <div className="mt-6">
        <ChurchTabs churchId={churchId} />
      </div>

      <div className="mt-6">{children}</div>
    </div>
  );
}

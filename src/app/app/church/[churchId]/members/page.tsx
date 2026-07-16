import { serverApiFetch } from "@/lib/api-server";
import { MembersManager } from "@/components/members/members-manager";
import type { ChurchMember } from "@/lib/types";

export default async function MembersPage({
  params,
}: {
  params: Promise<{ churchId: string }>;
}) {
  const { churchId } = await params;
  const data = await serverApiFetch<{ items: ChurchMember[]; nextCursor: string | null }>(
    `/churches/${churchId}/members?limit=50`,
  );

  return <MembersManager churchId={churchId} initial={data.items} />;
}

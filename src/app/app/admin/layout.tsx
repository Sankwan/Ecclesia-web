import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { serverApiFetch } from "@/lib/api-server";
import { AdminTabs } from "@/components/admin/admin-tabs";
import type { VerificationRecord } from "@/lib/types";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (session?.role !== "PLATFORM_ADMIN") redirect("/app");

  const pending = await serverApiFetch<VerificationRecord[]>("/admin/verifications?status=pending");

  return (
    <div>
      <div>
        <span className="eyebrow">Platform admin</span>
        <h1 className="font-display text-3xl font-semibold">Control room</h1>
      </div>
      <div className="mt-6">
        <AdminTabs pendingCount={pending.length} />
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}

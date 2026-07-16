import { serverApiFetch } from "@/lib/api-server";
import { ChurchesAdmin } from "@/components/admin/churches-admin";
import type { AdminChurch, AdminNotification } from "@/lib/types";

export default async function AdminChurchesPage() {
  const [churches, notifications] = await Promise.all([
    serverApiFetch<AdminChurch[]>("/admin/churches"),
    serverApiFetch<AdminNotification[]>("/admin/notifications"),
  ]);

  return <ChurchesAdmin churches={churches} notifications={notifications} />;
}

import { serverApiFetch } from "@/lib/api-server";
import { ProvidersDirectory } from "@/components/admin/providers-directory";
import type { AdminProvider } from "@/lib/types";

export default async function AdminProvidersPage() {
  const providers = await serverApiFetch<AdminProvider[]>("/admin/providers");
  return (
    <div>
      <h2 className="font-display text-xl font-semibold">Providers</h2>
      <p className="mt-1 text-sm text-ink-soft">The supply side — reach them, and suspend bad actors.</p>
      <div className="mt-5">
        <ProvidersDirectory providers={providers} />
      </div>
    </div>
  );
}

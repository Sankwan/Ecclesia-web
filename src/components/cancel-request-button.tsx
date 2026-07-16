"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";

export function CancelRequestButton({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cancel() {
    if (!confirm("Cancel this request? Providers who applied will be notified.")) return;
    setPending(true);
    setError(null);
    try {
      await apiFetch(`requests/${requestId}/cancel`, { method: "POST" });
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not cancel");
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="danger" onClick={cancel} disabled={pending} className="px-4 py-2 text-xs">
        {pending ? "Cancelling…" : "Cancel request"}
      </Button>
      {error && <span className="text-xs font-semibold text-emergency">{error}</span>}
    </div>
  );
}

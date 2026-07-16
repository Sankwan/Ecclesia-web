"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";

export function AcceptApplicationButton({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function accept() {
    setPending(true);
    setError(null);
    try {
      const booking = await apiFetch<{ id: string }>(`applications/${applicationId}/accept`, { method: "POST" });
      router.push(`/app/bookings/${booking.id}`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not accept — try again");
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button onClick={accept} disabled={pending} className="px-4 py-2 text-xs">
        {pending ? "Booking…" : "Accept"}
      </Button>
      {error && <span className="text-xs font-semibold text-emergency">{error}</span>}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api-client";

export function SuspendButton({
  userId,
  isActive,
  name,
}: {
  userId: string;
  isActive: boolean;
  name: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function toggle() {
    const suspend = isActive;
    if (suspend && !confirm(`Suspend ${name}? They won't be able to sign in.`)) return;
    setPending(true);
    try {
      await apiFetch(`admin/users/${userId}/suspend`, { method: "POST", body: { suspend } });
      router.refresh();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      className={
        isActive
          ? "rounded-[var(--radius-sm)] px-2 py-1 text-sm font-semibold text-emergency hover:bg-emergency-tint disabled:opacity-50"
          : "rounded-[var(--radius-sm)] px-2 py-1 text-sm font-semibold text-verified hover:bg-verified-tint disabled:opacity-50"
      }
    >
      {pending ? "…" : isActive ? "Suspend" : "Reactivate"}
    </button>
  );
}

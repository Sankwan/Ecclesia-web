"use client";

import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

type Role = "CHURCH_ADMIN" | "PROVIDER";

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const initialRole = params.get("role") === "provider" ? "PROVIDER" : params.get("role") === "church" ? "CHURCH_ADMIN" : null;

  const [role, setRole] = useState<Role | null>(initialRole);
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!role) {
      setError("Choose which describes you.");
      return;
    }
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? "Could not complete signup");
      router.push("/app");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-16">
      <span className="mb-10 font-display text-lg font-semibold">ChurchConnect</span>
      <form onSubmit={submit} className="flex flex-col gap-5">
        <div>
          <h1 className="font-display text-2xl font-bold">Tell us a bit about you</h1>
          <p className="mt-2 text-sm text-ink-soft">One-time setup — this decides what your dashboard shows.</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <RoleCard
            label="I run a church"
            active={role === "CHURCH_ADMIN"}
            onClick={() => setRole("CHURCH_ADMIN")}
          />
          <RoleCard
            label="I'm a provider"
            active={role === "PROVIDER"}
            onClick={() => setRole("PROVIDER")}
          />
        </div>

        <Field label="Full name">
          <Input
            type="text"
            placeholder="Ama Mensah"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            autoFocus
          />
        </Field>

        {error && <p className="text-sm font-semibold text-emergency">{error}</p>}
        <Button type="submit" disabled={pending}>
          {pending ? "Setting up…" : "Continue"}
        </Button>
      </form>
    </div>
  );
}

function RoleCard({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "border px-3 py-4 text-left font-display text-sm font-bold transition-colors",
        active ? "border-line bg-clay text-clay-ink" : "border-line hover:bg-surface-sunken",
      )}
    >
      {label}
    </button>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}

"use client";

import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const role = params.get("role");

  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function requestOtp(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/auth/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? "Could not send the code");
      setStep("code");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  }

  async function verifyOtp(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? "Incorrect code");
      router.push(data.isNewUser ? `/register${role ? `?role=${role}` : ""}` : "/app");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-16">
      <Link href="/" className="mb-10 font-display text-lg font-semibold">
        ChurchConnect
      </Link>

      {step === "phone" ? (
        <form onSubmit={requestOtp} className="flex flex-col gap-5">
          <div>
            <h1 className="font-display text-2xl font-bold">Log in or sign up</h1>
            <p className="mt-2 text-sm text-ink-soft">
              We&apos;ll text you a 6-digit code — no password to remember.
            </p>
          </div>
          <Field label="Phone number">
            <Input
              type="tel"
              inputMode="tel"
              placeholder="024 400 0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              autoFocus
            />
          </Field>
          {error && <p className="text-sm font-semibold text-emergency">{error}</p>}
          <Button type="submit" disabled={pending}>
            {pending ? "Sending…" : "Send code"}
          </Button>
        </form>
      ) : (
        <form onSubmit={verifyOtp} className="flex flex-col gap-5">
          <div>
            <h1 className="font-display text-2xl font-bold">Enter the code</h1>
            <p className="mt-2 text-sm text-ink-soft">Sent by SMS to {phone}.</p>
          </div>
          <Field label="6-digit code">
            <Input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              className="font-data text-center text-2xl tracking-[0.5em]"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              required
              autoFocus
            />
          </Field>
          {error && <p className="text-sm font-semibold text-emergency">{error}</p>}
          <Button type="submit" disabled={pending}>
            {pending ? "Checking…" : "Continue"}
          </Button>
          <button
            type="button"
            onClick={() => setStep("phone")}
            className="text-sm text-ink-soft underline underline-offset-2"
          >
            Use a different number
          </button>
        </form>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

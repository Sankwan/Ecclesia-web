"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/input";

export function ApplyForm({ requestId, suggestedMin, suggestedMax }: { requestId: string; suggestedMin: number; suggestedMax: number }) {
  const router = useRouter();
  const [offerGhs, setOfferGhs] = useState(suggestedMax);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await apiFetch(`requests/${requestId}/applications`, {
        method: "POST",
        idempotencyKey: crypto.randomUUID(),
        body: { offerGhs, message: message || undefined },
      });
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not apply");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="mt-6 max-w-md">
      <h2 className="font-display font-bold">Apply</h2>
      <form onSubmit={submit} className="mt-4 flex flex-col gap-4">
        <Field label="Your price (GHS)" hint={`Church's budget: GHS ${suggestedMin}-${suggestedMax}`}>
          <Input type="number" min={0} value={offerGhs} onChange={(e) => setOfferGhs(Number(e.target.value))} required />
        </Field>
        <Field label="Message (optional)">
          <Textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Experience, references…" />
        </Field>
        {error && <p className="text-sm font-semibold text-emergency">{error}</p>}
        <Button type="submit" disabled={pending}>
          {pending ? "Sending…" : "Send application"}
        </Button>
      </form>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import type { Booking } from "@/lib/types";

export function BookingActions({ booking, side }: { booking: Booking; side: "church" | "provider" }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [checkInCode, setCheckInCode] = useState("");
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  async function run(fn: () => Promise<unknown>) {
    setPending(true);
    setError(null);
    try {
      await fn();
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  }

  const alreadyReviewed = booking.reviews.some((r) => r.authorSide === side);
  const canCancel = ["CONFIRMED", "CHECKED_IN", "PENDING_CONFIRMATION"].includes(booking.status);
  const canReview = ["COMPLETED", "NO_SHOW"].includes(booking.status) && !alreadyReviewed;

  return (
    <div className="mt-8 flex flex-col gap-6">
      {error && <p className="text-sm font-semibold text-emergency">{error}</p>}

      {side === "provider" && booking.status === "CONFIRMED" && (
        <div className="flex flex-wrap items-end gap-3">
          <Field label="Check-in code" hint="Ask the church for the 4-digit code at the venue">
            <Input
              className="font-data w-32 text-center text-lg tracking-widest"
              maxLength={4}
              value={checkInCode}
              onChange={(e) => setCheckInCode(e.target.value.replace(/\D/g, ""))}
            />
          </Field>
          <Button
            disabled={pending || checkInCode.length !== 4}
            onClick={() => run(() => apiFetch(`bookings/${booking.id}/check-in`, { method: "POST", body: { code: checkInCode } }))}
          >
            Check in
          </Button>
        </div>
      )}

      {side === "provider" && (booking.status === "CHECKED_IN" || booking.status === "CONFIRMED") && (
        <Button
          disabled={pending}
          onClick={() => run(() => apiFetch(`bookings/${booking.id}/complete`, { method: "POST" }))}
        >
          Mark job done
        </Button>
      )}

      {side === "church" && booking.status === "PENDING_CONFIRMATION" && (
        <Button
          disabled={pending}
          onClick={() => run(() => apiFetch(`bookings/${booking.id}/complete`, { method: "POST" }))}
        >
          Confirm completed
        </Button>
      )}

      {canReview && !showReview && (
        <Button variant="secondary" onClick={() => setShowReview(true)}>
          Leave a review
        </Button>
      )}
      {canReview && showReview && (
        <div className="flex max-w-sm flex-col gap-3 rounded-full border border-line p-4">
          <Field label="Rating">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className={`font-data text-2xl ${n <= rating ? "text-gold" : "text-border"}`}
                  aria-label={`${n} stars`}
                >
                  ★
                </button>
              ))}
            </div>
          </Field>
          <Field label="Comment (optional)">
            <Textarea rows={2} value={comment} onChange={(e) => setComment(e.target.value)} />
          </Field>
          <Button
            disabled={pending}
            onClick={() =>
              run(async () => {
                await apiFetch(`bookings/${booking.id}/reviews`, { method: "POST", body: { rating, comment: comment || undefined } });
                setShowReview(false);
              })
            }
          >
            Submit review
          </Button>
        </div>
      )}

      {canCancel && !showCancel && (
        <button
          type="button"
          onClick={() => setShowCancel(true)}
          className="self-start text-sm font-semibold text-emergency underline underline-offset-2"
        >
          Cancel this booking
        </button>
      )}
      {canCancel && showCancel && (
        <div className="flex max-w-sm flex-col gap-3 rounded-[var(--radius)] border border-emergency p-4">
          <Field label="Reason">
            <Input value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} autoFocus />
          </Field>
          <div className="flex gap-2">
            <Button
              variant="danger"
              disabled={pending || !cancelReason}
              onClick={() => run(() => apiFetch(`bookings/${booking.id}/cancel`, { method: "POST", body: { reason: cancelReason } }))}
            >
              Confirm cancel
            </Button>
            <Button variant="ghost" onClick={() => setShowCancel(false)}>
              Never mind
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

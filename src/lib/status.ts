import type { ChipTone } from "@/components/ui/chip";

export interface StatusMeta {
  label: string;
  tone: ChipTone;
  solid: boolean;
}

const map: Record<string, StatusMeta> = {
  // RequestUrgency
  EMERGENCY: { label: "Emergency", tone: "red", solid: true },
  SCHEDULED: { label: "Scheduled", tone: "blue", solid: true },
  // RequestStatus
  OPEN: { label: "Open", tone: "neutral", solid: false },
  BOOKED: { label: "Booked", tone: "green", solid: true },
  EXPIRED: { label: "Expired", tone: "neutral", solid: false },
  CANCELLED: { label: "Cancelled", tone: "red", solid: false },
  // BookingStatus
  CONFIRMED: { label: "Confirmed", tone: "blue", solid: true },
  CHECKED_IN: { label: "Checked in", tone: "gold", solid: true },
  PENDING_CONFIRMATION: { label: "Awaiting confirmation", tone: "gold", solid: false },
  COMPLETED: { label: "Completed", tone: "green", solid: true },
  CANCELLED_BY_CHURCH: { label: "Cancelled by church", tone: "red", solid: false },
  CANCELLED_BY_PROVIDER: { label: "Cancelled by provider", tone: "red", solid: false },
  NO_SHOW: { label: "No-show", tone: "red", solid: true },
  DISPUTED: { label: "Disputed", tone: "red", solid: true },
  // ApplicationStatus
  PENDING: { label: "Pending", tone: "neutral", solid: false },
  ACCEPTED: { label: "Accepted", tone: "green", solid: true },
  DECLINED: { label: "Declined", tone: "neutral", solid: false },
  WITHDRAWN: { label: "Withdrawn", tone: "neutral", solid: false },
  // VerificationLevel
  UNVERIFIED: { label: "Unverified", tone: "neutral", solid: false },
  ID_VERIFIED: { label: "ID verified", tone: "blue", solid: true },
  SKILL_VERIFIED: { label: "Skill verified", tone: "blue", solid: true },
  TRUSTED: { label: "Trusted", tone: "gold", solid: true },
  // AvailabilityStatus
  AVAILABLE: { label: "Available", tone: "green", solid: true },
  BUSY: { label: "Busy", tone: "gold", solid: false },
  UNAVAILABLE: { label: "Unavailable", tone: "neutral", solid: false },
};

export function statusMeta(status: string): StatusMeta {
  return map[status] ?? { label: status, tone: "neutral", solid: false };
}

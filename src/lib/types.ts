export type Role = "CHURCH_ADMIN" | "PROVIDER" | "PLATFORM_ADMIN";
export type Urgency = "EMERGENCY" | "SCHEDULED";
export type RequestStatus = "OPEN" | "BOOKED" | "COMPLETED" | "CANCELLED" | "EXPIRED";
export type ApplicationStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "WITHDRAWN";
export type BookingStatus =
  | "CONFIRMED"
  | "CHECKED_IN"
  | "PENDING_CONFIRMATION"
  | "COMPLETED"
  | "CANCELLED_BY_CHURCH"
  | "CANCELLED_BY_PROVIDER"
  | "NO_SHOW"
  | "DISPUTED";
export type VerificationLevel = "UNVERIFIED" | "ID_VERIFIED" | "SKILL_VERIFIED" | "TRUSTED";
export type AvailabilityStatus = "AVAILABLE" | "BUSY" | "UNAVAILABLE";

export interface Skill {
  id: string;
  slug: string;
  name: string;
  category: string;
}

export interface Church {
  id: string;
  name: string;
  denomination: string | null;
  areaLabel: string;
  latitude: number;
  longitude: number;
  addressDetail: string | null;
  phone: string;
  isVerified: boolean;
  smsBalance: number;
  smsSenderId?: string | null;
  birthdaySettings?: BirthdaySettings;
  roleInChurch?: string;
  _count?: { members: number; requests: number; bookings: number };
}

export interface ServiceRequest {
  id: string;
  churchId: string;
  skillId: string;
  skill?: Skill;
  church?: { id: string; name: string; areaLabel: string; isVerified: boolean };
  urgency: Urgency;
  status: RequestStatus;
  serviceDate: string;
  startTime: string;
  durationMins: number;
  rehearsalNote: string | null;
  areaLabel: string;
  searchRadiusKm: number;
  budgetMinGhs: number;
  budgetMaxGhs: number;
  equipmentProvided: boolean;
  notes: string | null;
  distanceKm?: number;
  applications?: Application[];
  myApplication?: Application | null;
}

export interface Application {
  id: string;
  requestId: string;
  providerId: string;
  offerGhs: number;
  message: string | null;
  status: ApplicationStatus;
  createdAt: string;
  booking?: { id: string; status: BookingStatus } | null;
  provider?: {
    id: string;
    displayName: string;
    areaLabel: string;
    verification: VerificationLevel;
    completedCount: number;
    ratingSum: number;
    ratingCount: number;
    baseRateGhs: number | null;
  };
}

export interface Booking {
  id: string;
  status: BookingStatus;
  agreedGhs: number;
  checkInCode: string;
  paymentNote: string | null;
  serviceDate: string;
  startTime: string;
  durationMins: number;
  rehearsalNote: string | null;
  skill: Skill;
  equipmentProvided: boolean;
  notes: string | null;
  checkedInAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  reviews: { authorSide: string; rating: number; comment: string | null }[];
  church: {
    id: string;
    name: string;
    areaLabel: string;
    addressDetail: string | null;
    phone: string;
    contactName?: string;
    contactPhone?: string;
  };
  provider: { id: string; displayName: string; fullName: string; phone: string };
}

export interface ChurchMember {
  id: string;
  churchId: string;
  fullName: string;
  phone: string | null;
  gender: string | null;
  birthday: string | null;
  group: string | null;
  smsConsent: boolean;
}

export interface BirthdaySettings {
  enabled: boolean;
  template: string;
  sendHour?: number;
}

export interface SmsMessageStatus {
  id: string;
  toPhone: string;
  status: "QUEUED" | "SENT" | "DELIVERED" | "FAILED";
  provider: string | null;
  creditsUsed: number;
  sentAt: string | null;
  deliveredAt: string | null;
  failReason: string | null;
}

export interface Campaign {
  id: string;
  kind: string;
  template: string;
  scheduled: string | null;
  createdAt: string;
  messages: SmsMessageStatus[];
}

export interface ProviderProfile {
  id: string;
  userId: string;
  displayName: string;
  bio: string | null;
  areaLabel: string;
  latitude: number;
  longitude: number;
  travelRadiusKm: number;
  willTravelFar: boolean;
  availability: AvailabilityStatus;
  verification: VerificationLevel;
  baseRateGhs: number | null;
  completedCount: number;
  cancelledCount: number;
  ratingSum: number;
  ratingCount: number;
  skills: { providerId: string; skillId: string; years: number; skill: Skill }[];
  blackoutDates: { id: string; date: string }[];
}

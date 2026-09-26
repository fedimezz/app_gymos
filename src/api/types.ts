// Mirrors the backend's actual response shapes (see the corresponding
// route.ts files in the web repo) — kept minimal, extend as screens need
// more fields rather than guessing a full shape up front.

export type Role = "MEMBER" | "COACH" | "ADMIN" | "OWNER";
// Note: SUPER_ADMIN deliberately excluded — the mobile app is scoped to
// members and coaches only (owner/admin stays on the web dashboard).

export interface ClubSearchResult {
  slug: string;
  name: string;
  logoUrl: string | null;
  apiBaseUrl: string;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  clubId: string | null;
}

export interface LoginResponse {
  message: string;
  user: SessionUser & { phone: string | null; avatar: string | null };
  token: string; // present because we always send the mobile client header
}

export interface ApiErrorBody {
  error: string;
  requiresVerification?: boolean;
}

// ── Schedule / bookings ─────────────────────────────────────────────────────
export type DayOfWeek = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";
export type ActivityType =
  | "BODYBUILDING" | "FITNESS" | "CARDIO" | "CROSSFIT" | "YOGA" | "PILATES"
  | "BOXE" | "MMA" | "AQUAGYM" | "PADEL" | "ZUMBA" | "SPINNING";

export interface WeeklyPlanInfo {
  id: string;
  weekStart: string;
  weekEnd: string;
}

export interface ScheduleSession {
  id: string;
  weeklyPlanId: string;
  day: DayOfWeek;
  startTime: string; // "HH:mm"
  endTime: string;
  activity: ActivityType;
  coach: string;
  coachId: string | null;
  capacity: number;
  currentBookings: number;
  description: string | null;
  location: string;
  isBookedByUser: boolean;
  isFull: boolean;
  spotsLeft: number;
}

export interface ScheduleResponse {
  weeklyPlan: WeeklyPlanInfo | null;
  sessions: ScheduleSession[];
}

// ── Membership ───────────────────────────────────────────────────────────────
export interface MembershipCard {
  cardNumber: string;
  isActive: boolean;
  expiresAt: string | null;
}

export interface SubscriptionPayment {
  status: "PENDING" | "PAID" | "FAILED";
  paymentMethod: "ONLINE" | "ONSITE";
  paidAt?: string | null;
}

export interface MembershipSubscription {
  id: string;
  status: "ACTIVE" | "PENDING" | "EXPIRED" | "CANCELLED";
  startDate: string;
  endDate: string;
  plan: { id: string; name: string; price: number };
  payments: SubscriptionPayment[];
}

export interface MembershipPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  durationDays: number;
  features: string[];
}

export interface MembershipResponse {
  card: MembershipCard | null;
  activeSubscription: MembershipSubscription | null;
  plans: MembershipPlan[];
  history: MembershipSubscription[];
}

// ── Notifications ────────────────────────────────────────────────────────────
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  data?: Record<string, unknown> | null;
}

export interface NotificationsResponse {
  notifications: AppNotification[];
  unreadCount: number;
}

// ── Profile ──────────────────────────────────────────────────────────────────
export interface FullProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  role: Role;
}

// ── Coach ────────────────────────────────────────────────────────────────────
export interface CoachSession {
  id: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  activity: ActivityType;
  location: string;
  capacity: number;
  currentBookings: number;
}

export interface CoachSessionsResponse {
  coach: { id: string; name: string };
  sessions: CoachSession[];
}

export interface RosterMember {
  userId: string;
  name: string;
  avatar: string | null;
  checkedIn: boolean;
}

export interface RosterResponse {
  session: { id: string; activity: ActivityType; day: DayOfWeek; startTime: string };
  roster: RosterMember[];
}

export interface CoachStats {
  coachId: string;
  coachName: string;
  totalSessions: number;
  totalBookings: number;
  totalAttendances: number;
  fillRate: number;
}

// ── Posts / actualités ───────────────────────────────────────────────────────
export interface Post {
  id: string;
  title: string;
  content: string;
  imageUrl?: string | null;
  createdAt: string;
  author: { id: string; name: string; avatar: string | null };
  likes: { userId: string }[];
}


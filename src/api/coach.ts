import { apiGet, apiPost } from "@/api/client";
import type { CoachSessionsResponse, RosterResponse, CoachStats } from "@/api/types";

export function fetchCoachSessions(): Promise<CoachSessionsResponse> {
  return apiGet<CoachSessionsResponse>("/api/dashboard/coach/sessions");
}

export function fetchRoster(sessionId: string): Promise<RosterResponse> {
  return apiGet<RosterResponse>(`/api/dashboard/coach/sessions/${sessionId}/roster`);
}

export function setAttendance(
  sessionId: string,
  userId: string,
  undo: boolean
): Promise<{ checkedIn: boolean }> {
  return apiPost<{ checkedIn: boolean }>("/api/dashboard/coach/attendance", { sessionId, userId, undo });
}

export function fetchCoachStats(): Promise<CoachStats> {
  return apiGet<CoachStats>("/api/dashboard/coach/stats");
}

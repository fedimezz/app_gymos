import { apiGet, apiPost } from "@/api/client";
import type { NotificationsResponse } from "@/api/types";

export function fetchNotifications(limit = 50): Promise<NotificationsResponse> {
  return apiGet<NotificationsResponse>(`/api/dashboard/notifications?limit=${limit}`);
}

export function markNotificationRead(id: string): Promise<{ notification: unknown }> {
  return apiPost(`/api/dashboard/notifications/${id}/read`);
}

export function markAllNotificationsRead(): Promise<{ success: true; count: number }> {
  return apiPost("/api/dashboard/notifications/read-all");
}

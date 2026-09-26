// Thin fetch wrapper. Two things every authenticated request needs, kept
// here instead of passed around every screen:
//   1. which club's API host to hit (set once, after the user picks their
//      gym in ClubSearchScreen — see src/auth/AuthContext.tsx)
//   2. the bearer token (set once, after login/session-restore)
// AuthContext is the only thing that calls setApiBaseUrl/setAuthToken;
// everything else just calls apiFetch/apiGet/apiPost.
import { MOBILE_CLIENT_HEADER } from "@/config";
import type { ApiErrorBody } from "@/api/types";

let apiBaseUrl: string | null = null;
let authToken: string | null = null;

export function setApiBaseUrl(url: string | null): void {
  apiBaseUrl = url;
}
export function getApiBaseUrl(): string | null {
  return apiBaseUrl;
}
export function setAuthToken(token: string | null): void {
  authToken = token;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body: ApiErrorBody | null
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!apiBaseUrl) {
    // Programmer error, not a user-facing one — every screen that can call
    // this is only reachable after ClubSearchScreen has set a base URL.
    throw new Error("apiFetch called before a club was selected");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...MOBILE_CLIENT_HEADER,
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...(init.headers as Record<string, string> | undefined),
  };

  const res = await fetch(`${apiBaseUrl}${path}`, { ...init, headers });

  // Every route in the backend returns JSON, errors included — safe to
  // always parse, even on a non-2xx.
  const body = (await res.json().catch(() => null)) as (T & ApiErrorBody) | null;

  if (!res.ok) {
    throw new ApiError(body?.error ?? `Request failed (${res.status})`, res.status, body);
  }
  return body as T;
}

export const apiGet = <T>(path: string) => apiFetch<T>(path, { method: "GET" });
export const apiPost = <T>(path: string, data?: unknown) =>
  apiFetch<T>(path, { method: "POST", body: data !== undefined ? JSON.stringify(data) : undefined });
export const apiPut = <T>(path: string, data?: unknown) =>
  apiFetch<T>(path, { method: "PUT", body: data !== undefined ? JSON.stringify(data) : undefined });
export const apiDelete = <T>(path: string, data?: unknown) =>
  apiFetch<T>(path, { method: "DELETE", body: data !== undefined ? JSON.stringify(data) : undefined });

import { MOBILE_CLIENT_HEADER } from "@/config";
import type { ApiErrorBody } from "@/api/types";

let apiBaseUrl: string | null = null;
let clubSlug: string | null = null; // dev-only, see setClubSlug below
let authToken: string | null = null;

export function setApiBaseUrl(url: string | null): void {
  apiBaseUrl = url;
}
export function getApiBaseUrl(): string | null {
  return apiBaseUrl;
}
// Dev-only. Real per-club subdomains (https://slug.yourdomain.com) don't
// exist yet and can't exist over a raw LAN IP — every request stays on the
// platform apex in dev, and this header tells the backend which club (the
// same x-club-slug bypass resolveTenantFromRequest() already reads, no
// backend change needed). Unused in production.
export function setClubSlug(slug: string | null): void {
  clubSlug = slug;
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
    throw new Error("apiFetch called before a club was selected");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...MOBILE_CLIENT_HEADER,
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...(__DEV__ && clubSlug ? { "x-club-slug": clubSlug } : {}),
    ...(init.headers as Record<string, string> | undefined),
  };

  const res = await fetch(`${apiBaseUrl}${path}`, { ...init, headers });
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
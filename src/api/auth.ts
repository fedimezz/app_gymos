import { apiGet, apiPost } from "@/api/client";
import { PLATFORM_API_BASE_URL } from "@/config";
import type { ClubSearchResult, LoginResponse, SessionUser } from "@/api/types";

// Club search hits the platform's own apex (see PLATFORM_API_BASE_URL) —
// at this point the app doesn't yet know which club's host to use, since
// that's exactly what this call resolves. Every other function in this file
// runs AFTER a club is selected and apiBaseUrl is set (src/api/client.ts),
// so they don't need a host param.
export function searchClubs(query: string): Promise<{ clubs: ClubSearchResult[] }> {
  return fetch(`${PLATFORM_API_BASE_URL}/api/clubs/search?q=${encodeURIComponent(query)}`)
    .then((res) => res.json());
}

export function login(email: string, password: string): Promise<LoginResponse> {
  return apiPost<LoginResponse>("/api/auth/login", { email, password });
}

export function fetchSession(): Promise<{ user: SessionUser | null }> {
  return apiGet<{ user: SessionUser | null }>("/api/auth/session");
}

export function logout(): Promise<{ message: string }> {
  return apiPost<{ message: string }>("/api/auth/logout");
}

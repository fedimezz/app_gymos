// One place for the things that change between environments.

// The platform's own apex — where /api/clubs/search lives (see that file in
// the backend repo). This is the ONE host the app knows about before any
// club is selected; every other request goes to the selected club's own
// host instead (see src/api/client.ts).
//
// Set it in a `.env.local` file (see .env.example) — Expo inlines EXPO_PUBLIC_* at
// bundle time, restart `npx expo start` after changing it. The localhost
// fallback only works in a simulator, never in Expo Go on a real phone.
export const PLATFORM_API_BASE_URL = process.env.EXPO_PUBLIC_PLATFORM_API_URL ?? "http://localhost:3000";

// LOCAL BACKEND ONLY. /api/clubs/search answers with each club's own host
// (`https://<slug>.<apex>`), which a phone can't reach when the backend is
// `next dev` on your laptop. When this is set, every club search result is
// pointed at this URL instead (your laptop's LAN address); the backend then
// picks the club from DEV_DEFAULT_CLUB_SLUG. Leave unset against a deployed backend.
export const DEV_CLUB_API_BASE_URL: string | null = process.env.EXPO_PUBLIC_DEV_CLUB_API_URL || null;

// Sent on every request. The backend's login route only returns the raw JWT
// in the response body when it sees this header — see
// app/api/auth/login/route.ts in the backend repo. Without it the app would
// get an httpOnly session cookie it has no way to read or resend.
export const MOBILE_CLIENT_HEADER = { "x-client-type": "mobile-app" } as const;

export const STORAGE_KEYS = {
  token: "gymos.token",
  clubApiBaseUrl: "gymos.clubApiBaseUrl",
  clubName: "gymos.clubName",
} as const;

// One place for the things that change between environments.
//
// PLATFORM_API_BASE_URL comes from .env.local (gitignored) instead of
// being hardcoded here — this repo is public, so no LAN IP or real backend
// host belongs in a committed file.
//
// Setup: create a .env.local next to package.json with
//   EXPO_PUBLIC_PLATFORM_API_BASE_URL=http://192.168.X.X:3000
// (find your LAN IP: `ipconfig` on Windows, `ifconfig`/`ip addr` on mac/
// Linux; phone and computer must be on the same Wi-Fi). Expo inlines
// EXPO_PUBLIC_* at bundle time — a running Metro won't pick up a new/edited
// .env.local, restart with `npx expo start -c`.
const envApiBaseUrl = process.env.EXPO_PUBLIC_PLATFORM_API_BASE_URL;
if (!envApiBaseUrl) {
  throw new Error(
      "Missing EXPO_PUBLIC_PLATFORM_API_BASE_URL — create a .env.local (see src/config/index.ts) and restart with `npx expo start -c`."
  );
}
export const PLATFORM_API_BASE_URL = envApiBaseUrl;

// Sent on every request. The backend's login route only returns the raw JWT
// in the response body when it sees this header — see
// app/api/auth/login/route.ts in the backend repo. Without it the app would
// get an httpOnly session cookie it has no way to read or resend.
export const MOBILE_CLIENT_HEADER = { "x-client-type": "mobile-app" } as const;

export const STORAGE_KEYS = {
  token: "gymos.token",
  clubApiBaseUrl: "gymos.clubApiBaseUrl",
  clubSlug: "gymos.clubSlug",
  clubName: "gymos.clubName",
} as const;
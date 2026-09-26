// One place for the things that change between environments.

// The platform's own apex — where /api/clubs/search lives (see that file in
// the backend repo). This is the ONE host the app knows about before any
// club is selected; every other request goes to the selected club's own
// host instead (see src/api/client.ts).
// TODO: replace with your real deployed apex before running on a device —
// localhost only works in the iOS Simulator, not Expo Go on a real phone.
export const PLATFORM_API_BASE_URL = "http://localhost:3000";

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

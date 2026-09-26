# GymOS Mobile

Expo (React Native + TypeScript) app for **members and coaches**. Owners and
admins keep using the web dashboard (`saasssss-club`) — this app doesn't
have those roles at all, by design.

## Status: connection layer proven, feature screens not started

What exists and is real, working code:
- Club search (`GET /api/clubs/search` on the backend)
- Login (email/password, gets a token back because the app sends
  `x-client-type: mobile-app` — see `src/config/index.ts`)
- Token persisted in `expo-secure-store`, restored on app launch via
  `GET /api/auth/session`
- Logout
- A placeholder home screen proving all of the above actually round-trips:
  club name, your name, email, role

What does **not** exist yet: bookings, schedule, membership status, coach
roster, notifications, profile editing — every actual feature screen. That's
deliberate — see "Next: flow & design" below.

`npx tsc --noEmit` passes clean. Metro bundling wasn't verified in the
sandbox this was built in (network-restricted, couldn't reach Expo's
version-check API even in offline mode for the web-export path) — **run
`npm install && npx expo start` on your own machine first**, before
building anything further on top, to confirm it actually launches.

## Setup

```
npm install
```

Edit `src/config/index.ts`:
```ts
export const PLATFORM_API_BASE_URL = "http://localhost:3000"; // or your deployed apex
```
`localhost` only works in the iOS Simulator. To test on a real phone via
Expo Go, use your machine's LAN IP (`http://192.168.x.x:3000`) or your real
deployed URL.

```
npx expo start
```
Scan the QR code with Expo Go (iOS/Android) — no Xcode or Android Studio
needed for this stage of development.

Run the backend (`saasssss-club`) locally alongside it, or point
`PLATFORM_API_BASE_URL` at your deployed instance.

## Project structure

```
src/
  api/
    client.ts     — fetch wrapper: injects auth token + mobile header on every request
    auth.ts       — searchClubs / login / fetchSession / logout
    types.ts      — shapes mirroring the backend's actual responses
  auth/
    AuthContext.tsx — the only thing that touches SecureStore; owns { user, club, login, logout }
  screens/        — ClubSearchScreen, LoginScreen, HomeScreen (proof screens only)
  navigation/
    RootNavigator.tsx — three plain `if`s for now; see the comment in that file
      for when to swap in a real @react-navigation stack (already installed,
      just unused)
  config/         — PLATFORM_API_BASE_URL, storage keys, the mobile-client header
```

## Next: flow & design

Deliberately stopped here rather than guess at every screen. Before building
further, worth deciding together:

**For members:**
- What's the home screen — today's booked sessions? A dashboard of stats?
  Just a quick-actions list?
- Booking flow — browse the weekly schedule and tap to book, or a simpler
  "book your usual slot" shortcut?
- How much of the web dashboard's member area (`/dashboard/*` in the backend
  repo — bookings, membership status, notifications, profile) needs a mobile
  equivalent for v1, versus can wait?

**For coaches:**
- Primary need is almost certainly "who's in my session today" (roster) —
  confirm that's the anchor screen?
- Do coaches need to see their own schedule across the week, or just today?
- Any actions they need (mark attendance, message a member) for v1?

**Shared:**
- Push notifications — worth wiring up now (session reminders, booking
  confirmations) or later?
- Bottom tabs differ by role (member tabs vs coach tabs) — confirm the
  split above before I build the tab navigators.

Once that's settled, the next slice is: pick ONE flow (member booking, most
likely), build it fully end-to-end against the real backend, and use that as
the template for the rest rather than scaffolding everything at once.

# Build status — read this before continuing

Steps 1–4 of the build order are done. What remains is a **polish pass, and it
must wait until the app has been run on a real device via Expo Go** (this
sandbox has no simulator).

## What was checked, and what was not

Checked in the sandbox: `npx tsc --noEmit` clean; `EXPO_OFFLINE=1 CI=1 npx expo export --platform android|ios`
bundles (≈970 modules); every call in `src/api/*.ts` was cross-checked against the
backend's `route.ts` files (path + HTTP method); date helpers and `useAsync`
were behavior-tested in isolation.

**NOT checked: anything running on a device.** No screen has been rendered or
tapped. Expect layout and runtime surprises on the first Expo Go run.

## How to run

1. `npm install`
2. `cp .env.example .env.local` and fill in the backend URL (deployed apex, or
   your laptop's LAN address for a local backend — see the comments in the file).
3. `npx expo start`, scan the QR code with Expo Go (phone on the same Wi-Fi).
4. Search your club, log in as a MEMBER, then log out and log in as a COACH
   (a coach must have a linked `Coach` record or the coach screens show the
   backend's "Aucun profil coach lié à ce compte").

## Structure

- `src/navigation/` — `RootNavigator` (auth-driven native stack), `MemberTabs`
  (Home/Schedule/Membership/Profile), `CoachTabs` (Today/Schedule/Profile),
  `types.ts` (all param lists). ADMIN/OWNER get `UnsupportedRoleScreen`.
  Pushed over the tabs: `Notifications` (member + coach), `CoachRoster` (coach).
- `src/screens/member/` — Home, Schedule (the template), Membership, plus
  `useBookingFlow` (book/cancel shared by Home and Schedule), `SessionSheet`,
  `SubscribeSheet`, cards.
- `src/screens/coach/` — Today, Schedule, Roster (attendance), Profile (stats).
- `src/screens/shared/` — `ProfileScreen` (both roles), `NotificationsScreen`.
- `src/components/` — original primitives + `Avatar`, `CapacityBar`,
  `NoticeBanner`, `TextField`. `src/hooks/` — `useAsync`, `useNotice`, `useNow`.
- `src/lib/` — `dates.ts` (Monday-based week math, French labels, no Intl),
  `labels.ts`, `format.ts`.

## Changes to existing code (deliberate, all in the working tree)

- `package.json`: `babel-preset-expo` added (Metro could not start without it —
  it was nested under `expo/` where `babel.config.js` can't resolve it);
  `expo-secure-store`, `react-native-screens`, `react-native-safe-area-context`,
  `react-native-gesture-handler` aligned to the SDK 57 versions; `expo-web-browser` added.
- `useAsync`: dep change drops old data; stale responses ignored; retry after a
  failed first load shows the skeleton; `reload` keeps data when it has some.
- `AuthContext` / `client.ts`: expired token at launch → login screen (the
  backend answers 401, not `{user:null}`); network failure at launch → retry
  screen; any later 401 → login; `patchUser` keeps the greeting in step with a profile edit.
- `App.tsx`: root `SafeAreaView` replaced by a `View` (navigators own the insets).
- `src/api/*`: corrected against the backend — notifications use `sentAt`/`readAt`
  and **PUT**; subscribe returns `paymentUrl` (not `payUrl`); added `resumePayment`;
  `Post` uses `mediaUrl`/`mediaType`; past subscriptions' `plan` has no `id`;
  `SUSPENDED` status added.
- `src/config`: backend URL now comes from `EXPO_PUBLIC_PLATFORM_API_URL`;
  optional `EXPO_PUBLIC_DEV_CLUB_API_URL` for a local backend.

## Known limitations and decisions

- **Language toggle omitted** from Profile: the UI is hardcoded French and there
  is no i18n layer, so a selector would save a preference that changes nothing.
- **Profile has no empty state** (a profile always has content); its states are loading / error / success.
- **Coach "today"** = sessions on today's weekday in the club's *active* plan.
  `/api/dashboard/coach/sessions` doesn't say which week that plan covers, so
  this assumes it is the current calendar week.
- **Attendance** is stored per calendar day by the backend, so check-in is only
  offered on the session's own weekday. "Mark all present" is one request per member (no bulk endpoint).
- **Booking a session that already started is allowed** — same as the web app and the backend.
- **Online payment** opens the payment page in the in-app browser; the
  subscription turns ACTIVE via a server webhook, so the screen re-reads on
  close and the user can pull to refresh.
- `GET /api/posts` has no pagination; the app shows the latest 5.
- Not built (not in the brief): avatar upload, password change, account deletion, likes/comments.
- `ClubSearchScreen` and `LoginScreen` still hardcode hex colors (white in dark
  mode) and there is no way back to club search from Login. `Card` keeps a
  pre-existing `#000` shadow color.

## Best way to continue — copy-paste this to resume

```
Continue the GymOS mobile app (gymos-mobile) exactly where BUILD_STATUS.md
left off. Read that file first.

Rules:
- Every screen must call the REAL API modules in src/api/ — never invent a
  new shape, check src/api/types.ts against the actual backend route.ts
  files in the saasssss-club repo if anything is unclear.
- Use the existing primitives (Card, Button, Badge, EmptyState, ErrorState,
  Skeleton, BottomSheet, ScreenContainer, useAsync) — don't rebuild them
  per-screen.
- Every screen needs all 4 states: loading (Skeleton), empty (EmptyState +
  CTA), error (ErrorState + retry via useAsync's `reload`), and success.
- Colors always come from useTheme().colors — never a hardcoded hex.
- Build ONE screen fully, run `npx tsc --noEmit`, confirm clean, before
  starting the next. Don't batch multiple screens before checking.

Next: fix whatever broke on the first real-device run (paste the Expo Go
errors/screenshots), then the polish pass.
```

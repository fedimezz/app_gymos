# Build status — read this before continuing

## Done (typechecks clean — `npx tsc --noEmit`)

**Connection layer** (proven working end-to-end against the real backend):
- `src/api/client.ts` — fetch wrapper, injects Bearer token + mobile header
- `src/api/auth.ts` — searchClubs / login / fetchSession / logout
- `src/auth/AuthContext.tsx` — SecureStore persistence, session restore on launch
- `src/screens/ClubSearchScreen.tsx`, `LoginScreen.tsx`, `HomeScreen.tsx` (placeholder)
- `src/navigation/RootNavigator.tsx` — currently three plain `if`s (search → login → home), NOT yet the real tab navigators

**Theme system** (built, wired into `App.tsx`, not yet used by any real screen):
- `src/theme/palette.ts` — derives a full color palette from the club's ONE
  stored brand color (`GymSettings.primaryColor`), light + dark variants
- `src/theme/ThemeContext.tsx` — `useTheme()`, persisted light/dark/system mode
- `src/theme/ThemeSync.tsx` — fetches `/api/settings/public` and feeds the
  club's color into the palette automatically once a club is selected

**API modules** (typed against the real backend response shapes — verified
by reading the actual route.ts files, not guessed):
- `src/api/schedule.ts` — fetchSchedule, bookSession, cancelBooking
- `src/api/membership.ts` — fetchMembership, subscribeToPlan
- `src/api/notifications.ts` — fetchNotifications, markRead, markAllRead
- `src/api/profile.ts` — fetchProfile, updateProfile
- `src/api/coach.ts` — fetchCoachSessions, fetchRoster, setAttendance, fetchCoachStats
- `src/api/posts.ts` — fetchPosts (actualités)
- `src/api/types.ts` — every shape above, matching the backend exactly

**Shared UI primitives** (built, not yet used by any real screen):
- `src/components/Card.tsx`, `Button.tsx`, `Badge.tsx` (status pills)
- `src/components/StateViews.tsx` — `EmptyState`, `ErrorState` (with retry)
- `src/components/Skeleton.tsx` — animated loading placeholder
- `src/components/BottomSheet.tsx` — for booking/cancel confirmations
- `src/components/ScreenContainer.tsx` — safe area + pull-to-refresh wrapper
- `src/hooks/useAsync.ts` — one hook standardizing loading/error/refresh so
  every screen doesn't reimplement that logic

**Verified**: `npx tsc --noEmit` passes clean, AND `npx expo export --platform web`
successfully bundles (confirmed after adding `babel-preset-expo` as an
explicit devDependency, which was missing — a real bug, not a sandbox
restriction as I first assumed). If you ever hit
`Cannot find module 'babel-preset-expo'`, that means an older copy of this
zip — `npm install --save-dev babel-preset-expo` and `npx expo start -c`
fixes it without waiting for a new zip.

**One runtime bug found and fixed via real device testing** (this is
exactly why the phone/Expo Go step matters — `tsc` and bundling don't
execute the app's JS, so neither catches a runtime-only error):
`expo-secure-store` has no web implementation (it wraps the iOS Keychain /
Android Keystore, neither exists in a browser), so it threw the moment
Expo's dev server auto-opened a browser tab. Fixed with `src/storage/index.ts`
— routes to `localStorage` on web, `SecureStore` on native, same async
interface either way. Code-reviewed and the bundle still succeeds with it in
place, but NOT executed in a live browser in this environment (tried — no
installable browser here either). **The real target is phone via Expo Go,
where this was never actually broken** (SecureStore works natively there);
this fix just stops the web preview from crashing too.

---

## Not done — in the order you specified

1. **Member Schedule + booking/cancel flow** — the actual screen. Everything
   it needs exists (`fetchSchedule`/`bookSession`/`cancelBooking`,
   `BottomSheet`, `Badge`, `useAsync`) but the screen itself isn't written.
2. **Member Home** (today-filtered) — replace the placeholder `HomeScreen.tsx`
   with the real one: greeting, next session today, countdown, cancel
   action, empty state, actualités feed, week summary.
3. **Membership** — card, plan, expiration, subscribe/renew.
4. **Profile** (member) — edit info, notifications list, language, theme
   toggle (`useTheme().setMode` already exists), help/about, logout.
5. **Coach Today** — today's assigned sessions, tap → roster.
6. **Coach Roster + attendance** — member list, search, one-tap toggle,
   "mark all present", count, validate.
7. **Coach Schedule** — full week, assigned sessions only.
8. **Coach Profile/stats** — `fetchCoachStats` already built.
9. **Bottom tab navigation** — `RootNavigator.tsx` needs replacing with real
   `@react-navigation` stacks: a Member tab navigator (Home/Schedule/
   Membership/Profile) and a Coach tab navigator (Today/Schedule/Profile),
   switched based on `user.role` from `AuthContext`. Packages are already
   installed (`@react-navigation/*`), just unused so far.
10. **Final responsive/UX polish pass** — can't be done meaningfully until
    the above exist and have been run on a real device (this sandbox has no
    simulator).

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

Order:
1. Real bottom tab navigation first (item 9 in BUILD_STATUS.md) — every
   screen after this needs somewhere to live.
2. Member Schedule + booking/cancel (the template the rest follows).
3. Member Home, Membership, Profile.
4. Coach Today + Roster/attendance, Coach Schedule, Coach Profile/stats.
5. Only then: a polish pass, and only after confirming on a real device via
   Expo Go — this environment has no simulator to verify against.
```

// The single source of truth for "who is logged in, at which club" — every
// screen reads this instead of managing its own auth state. Also the only
// thing that touches SecureStore or the api client's module-level
// token/baseUrl (src/api/client.ts).
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import * as SecureStore from "expo-secure-store";
import { STORAGE_KEYS } from "@/config";
import { ApiError, setApiBaseUrl, setAuthToken, setUnauthorizedHandler } from "@/api/client";
import { login as apiLogin, logout as apiLogout, fetchSession } from "@/api/auth";
import type { ClubSearchResult, SessionUser } from "@/api/types";

interface AuthContextValue {
  // undefined = still restoring from SecureStore on app launch; null = restored, nobody logged in
  user: SessionUser | null | undefined;
  club: { name: string; apiBaseUrl: string } | null;
  // true when the launch-time session check failed for a NETWORK reason (not
  // a bad token). `user` stays undefined; RootNavigator shows a retry state.
  restoreFailed: boolean;
  retryRestore: () => void;
  selectClub: (club: ClubSearchResult) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  // Keep the cached session user in step with a profile edit, so greetings elsewhere update.
  patchUser: (patch: Partial<Pick<SessionUser, "name">>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null | undefined>(undefined);
  const [club, setClub] = useState<{ name: string; apiBaseUrl: string } | null>(null);
  const [restoreFailed, setRestoreFailed] = useState(false);

  // Forget the token locally (SecureStore + api client) and drop to the login
  // screen. Shared by logout, by an expired/invalid token at launch, and by
  // any later 401 (see setUnauthorizedHandler in src/api/client.ts).
  const clearSession = useCallback(async () => {
    setAuthToken(null);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.token);
    setUser(null);
  }, []);

  // On launch: re-hydrate the club host + token from SecureStore, then ask
  // the backend who that token belongs to (rather than trusting a possibly
  // stale/expired local copy of the user object).
  const restoreSession = useCallback(async () => {
    setRestoreFailed(false);
    const [storedBaseUrl, storedClubName, storedToken] = await Promise.all([
      SecureStore.getItemAsync(STORAGE_KEYS.clubApiBaseUrl),
      SecureStore.getItemAsync(STORAGE_KEYS.clubName),
      SecureStore.getItemAsync(STORAGE_KEYS.token),
    ]);

    if (!storedBaseUrl || !storedToken) {
      setUser(null);
      return;
    }

    setApiBaseUrl(storedBaseUrl);
    setAuthToken(storedToken);
    setClub({ name: storedClubName ?? "", apiBaseUrl: storedBaseUrl });

    try {
      const { user: restoredUser } = await fetchSession();
      setUser(restoredUser);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        // GET /api/auth/session answers 401 (not 200 + null) for an expired,
        // revoked or deactivated session. Go to login for this club.
        await clearSession();
      } else {
        // Network/server error on launch: don't force a logout over a
        // transient failure — RootNavigator shows a retry state instead.
        setRestoreFailed(true);
      }
    }
  }, [clearSession]);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  // Any authenticated request that later comes back 401 sends the user to login.
  useEffect(() => {
    setUnauthorizedHandler(() => void clearSession());
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  const selectClub = async (selected: ClubSearchResult) => {
    setApiBaseUrl(selected.apiBaseUrl);
    setClub({ name: selected.name, apiBaseUrl: selected.apiBaseUrl });
    await Promise.all([
      SecureStore.setItemAsync(STORAGE_KEYS.clubApiBaseUrl, selected.apiBaseUrl),
      SecureStore.setItemAsync(STORAGE_KEYS.clubName, selected.name),
    ]);
  };

  const login = async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    setAuthToken(res.token);
    await SecureStore.setItemAsync(STORAGE_KEYS.token, res.token);
    setUser(res.user);
  };

  const logout = async () => {
    try {
      await apiLogout(); // best-effort — clears the (unused-by-mobile) cookie server-side too
    } catch {
      /* token might already be invalid — clearing local state below is what actually matters */
    }
    await clearSession();
    // Deliberately NOT clearing the stored club — logging out shouldn't make
    // them re-search for their own gym next time they open the app.
  };

  const patchUser = useCallback((patch: Partial<Pick<SessionUser, "name">>) => {
    setUser((current) => (current ? { ...current, ...patch } : current));
  }, []);

  const value = useMemo(
    () => ({ user, club, restoreFailed, retryRestore: () => void restoreSession(), selectClub, login, logout, patchUser }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, club, restoreFailed, restoreSession, patchUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

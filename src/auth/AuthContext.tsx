// The single source of truth for "who is logged in, at which club" — every
// screen reads this instead of managing its own auth state. Also the only
// thing that touches SecureStore or the api client's module-level
// token/baseUrl (src/api/client.ts).
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getItem, setItem, deleteItem } from "@/storage";
import { STORAGE_KEYS } from "@/config";
import { setApiBaseUrl, setAuthToken } from "@/api/client";
import { login as apiLogin, logout as apiLogout, fetchSession } from "@/api/auth";
import type { ClubSearchResult, SessionUser } from "@/api/types";

interface AuthContextValue {
  // undefined = still restoring from SecureStore on app launch; null = restored, nobody logged in
  user: SessionUser | null | undefined;
  club: { name: string; apiBaseUrl: string } | null;
  selectClub: (club: ClubSearchResult) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null | undefined>(undefined);
  const [club, setClub] = useState<{ name: string; apiBaseUrl: string } | null>(null);

  // On launch: re-hydrate the club host + token from SecureStore, then ask
  // the backend who that token belongs to (rather than trusting a possibly
  // stale/expired local copy of the user object).
  useEffect(() => {
    (async () => {
      const [storedBaseUrl, storedClubName, storedToken] = await Promise.all([
        getItem(STORAGE_KEYS.clubApiBaseUrl),
        getItem(STORAGE_KEYS.clubName),
        getItem(STORAGE_KEYS.token),
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
        setUser(restoredUser); // null if the token's no longer valid — backend is the source of truth
      } catch {
        // Network error on launch: don't force a logout over a transient
        // failure. Leave user as undefined; screens should show a retry
        // state rather than bouncing straight to the login screen.
      }
    })();
  }, []);

  const selectClub = async (selected: ClubSearchResult) => {
    setApiBaseUrl(selected.apiBaseUrl);
    setClub({ name: selected.name, apiBaseUrl: selected.apiBaseUrl });
    await Promise.all([
      setItem(STORAGE_KEYS.clubApiBaseUrl, selected.apiBaseUrl),
      setItem(STORAGE_KEYS.clubName, selected.name),
    ]);
  };

  const login = async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    setAuthToken(res.token);
    await setItem(STORAGE_KEYS.token, res.token);
    setUser(res.user);
  };

  const logout = async () => {
    try {
      await apiLogout(); // best-effort — clears the (unused-by-mobile) cookie server-side too
    } catch {
      /* token might already be invalid — clearing local state below is what actually matters */
    }
    setAuthToken(null);
    await deleteItem(STORAGE_KEYS.token);
    setUser(null);
    // Deliberately NOT clearing the stored club — logging out shouldn't make
    // them re-search for their own gym next time they open the app.
  };

  const value = useMemo(() => ({ user, club, selectClub, login, logout }), [user, club]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

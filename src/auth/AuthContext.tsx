import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { storage } from "@/lib/storage";
import { STORAGE_KEYS, PLATFORM_API_BASE_URL } from "@/config";
import { setApiBaseUrl, setClubSlug, setAuthToken } from "@/api/client";
import { login as apiLogin, logout as apiLogout, fetchSession } from "@/api/auth";
import type { ClubSearchResult, SessionUser } from "@/api/types";

interface AuthContextValue {
  user: SessionUser | null | undefined;
  club: { name: string; apiBaseUrl: string } | null;
  restoreFailed: boolean;
  retryRestore: () => void;
  selectClub: (club: ClubSearchResult) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  patchUser: (patch: Partial<SessionUser>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null | undefined>(undefined);
  const [club, setClub] = useState<{ name: string; apiBaseUrl: string } | null>(null);
  const [restoreFailed, setRestoreFailed] = useState(false);

  const restoreSession = useCallback(async () => {
    setRestoreFailed(false);

    const [storedBaseUrl, storedSlug, storedClubName, storedToken] = await Promise.all([
      storage.getItemAsync(STORAGE_KEYS.clubApiBaseUrl),
      storage.getItemAsync(STORAGE_KEYS.clubSlug),
      storage.getItemAsync(STORAGE_KEYS.clubName),
      storage.getItemAsync(STORAGE_KEYS.token),
    ]);

    if (!storedBaseUrl || !storedToken) {
      setUser(null);
      return;
    }

    setApiBaseUrl(storedBaseUrl);
    setClubSlug(storedSlug || null);
    setAuthToken(storedToken);
    setClub({ name: storedClubName ?? "", apiBaseUrl: storedBaseUrl });

    try {
      const { user: restoredUser } = await fetchSession();
      setUser(restoredUser);
    } catch {
      // Transient network error on launch — keep the stored session (don't
      // force logout) but stop spinning forever; retryRestore lets the user
      // try again once they're back online.
      setRestoreFailed(true);
    }
  }, []);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  const selectClub = async (selected: ClubSearchResult) => {
    const baseUrl = __DEV__ ? PLATFORM_API_BASE_URL : selected.apiBaseUrl;
    const slug = __DEV__ ? selected.slug : null;

    setApiBaseUrl(baseUrl);
    setClubSlug(slug);
    setClub({ name: selected.name, apiBaseUrl: baseUrl });
    await Promise.all([
      storage.setItemAsync(STORAGE_KEYS.clubApiBaseUrl, baseUrl),
      storage.setItemAsync(STORAGE_KEYS.clubSlug, slug ?? ""),
      storage.setItemAsync(STORAGE_KEYS.clubName, selected.name),
    ]);
  };

  const login = async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    setAuthToken(res.token);
    await storage.setItemAsync(STORAGE_KEYS.token, res.token);
    setUser(res.user);
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch {
      /* token might already be invalid */
    }
    setAuthToken(null);
    await storage.deleteItemAsync(STORAGE_KEYS.token);
    setUser(null);
  };

  const patchUser = (patch: Partial<SessionUser>) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const value = useMemo(
      () => ({ user, club, restoreFailed, retryRestore: restoreSession, selectClub, login, logout, patchUser }),
      [user, club, restoreFailed, restoreSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getItem, setItem, deleteItem } from "@/storage";
import { STORAGE_KEYS, PLATFORM_API_BASE_URL } from "@/config";
import { setApiBaseUrl, setClubSlug, setAuthToken } from "@/api/client";
import { login as apiLogin, logout as apiLogout, fetchSession } from "@/api/auth";
import type { ClubSearchResult, SessionUser } from "@/api/types";

interface AuthContextValue {
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

  useEffect(() => {
    (async () => {
      const [storedBaseUrl, storedSlug, storedClubName, storedToken] = await Promise.all([
        getItem(STORAGE_KEYS.clubApiBaseUrl),
        getItem(STORAGE_KEYS.clubSlug),
        getItem(STORAGE_KEYS.clubName),
        getItem(STORAGE_KEYS.token),
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
        // transient network error on launch — don't force logout
      }
    })();
  }, []);

  const selectClub = async (selected: ClubSearchResult) => {
    const baseUrl = __DEV__ ? PLATFORM_API_BASE_URL : selected.apiBaseUrl;
    const slug = __DEV__ ? selected.slug : null;

    setApiBaseUrl(baseUrl);
    setClubSlug(slug);
    setClub({ name: selected.name, apiBaseUrl: baseUrl });
    await Promise.all([
      setItem(STORAGE_KEYS.clubApiBaseUrl, baseUrl),
      setItem(STORAGE_KEYS.clubSlug, slug ?? ""),
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
      await apiLogout();
    } catch {
      /* token might already be invalid */
    }
    setAuthToken(null);
    await deleteItem(STORAGE_KEYS.token);
    setUser(null);
  };

  const value = useMemo(() => ({ user, club, selectClub, login, logout }), [user, club]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
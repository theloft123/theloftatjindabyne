 "use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Role = "guest" | "admin";

type AccessContextValue = {
  role: Role | null;
  token: string | null;
  setAccess: (role: Role, token?: string | null) => void;
  clearAccess: () => void;
};

const AccessContext = createContext<AccessContextValue | undefined>(undefined);

const STORAGE_KEY = "theloft_access_session";

type StoredSession = {
  role: Role;
  token?: string;
};

export function AccessProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as StoredSession;
      if (parsed.role === "admin" || parsed.role === "guest") {
        setRole(parsed.role);
        setToken(parsed.token ?? null);
      }
    } catch (error) {
      console.warn("Failed to parse stored access session", error);
    }
  }, []);

  const setAccess = useCallback((nextRole: Role, nextToken?: string | null) => {
    setRole(nextRole);
    setToken(nextToken ?? null);
    if (typeof window !== "undefined") {
      const session: StoredSession = {
        role: nextRole,
        token: nextToken ?? undefined,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    }
  }, []);

  const clearAccess = useCallback(() => {
    setRole(null);
    setToken(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const value = useMemo(
    () => ({
      role,
      token,
      setAccess,
      clearAccess,
    }),
    [clearAccess, role, setAccess, token]
  );

  return (
    <AccessContext.Provider value={value}>{children}</AccessContext.Provider>
  );
}

export function useAccess() {
  const context = useContext(AccessContext);
  if (!context) {
    throw new Error("useAccess must be used within AccessProvider");
  }
  return context;
}


import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi } from "../api/services";

interface User {
  id: string;
  name: string;
  email: string;
  businessName: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, businessName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  // Start true if there's a stored token — we need to validate it first
  const [loading, setLoading] = useState<boolean>(() => !!localStorage.getItem("token"));

  // Validate stored token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      setLoading(false);
      return;
    }
    authApi.getProfile()
      .then((res) => {
        const u = res.data.data;
        setUser(u);
        setToken(storedToken);
        localStorage.setItem("user", JSON.stringify(u));
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    const { token: jwt, user: u } = res.data.data;
    localStorage.setItem("token", jwt);
    localStorage.setItem("user", JSON.stringify(u));
    setToken(jwt);
    setUser(u);
  }, []);

  const register = useCallback(async (
    name: string,
    businessName: string,
    email: string,
    password: string
  ) => {
    const res = await authApi.register(name, businessName, email, password);
    const { token: jwt, user: u } = res.data.data;
    localStorage.setItem("token", jwt);
    localStorage.setItem("user", JSON.stringify(u));
    setToken(jwt);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((data: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    return {
      user: null, token: null, loading: false,
      login: async () => {}, register: async () => {},
      logout: () => {}, updateUser: () => {},
    };
  }
  return ctx;
}

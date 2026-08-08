"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("devbhakt_token");
    const storedUser = localStorage.getItem("devbhakt_user");
    if (storedToken) setToken(storedToken);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const persist = useCallback((nextUser, nextToken) => {
    setUser(nextUser);
    setToken(nextToken);
    if (nextToken) localStorage.setItem("devbhakt_token", nextToken);
    if (nextUser) localStorage.setItem("devbhakt_user", JSON.stringify(nextUser));
  }, []);

  const login = useCallback(
    async (email, password) => {
      const data = await api.login({ email, password });
      persist(data.user, data.token);
      return data.user;
    },
    [persist]
  );

  const register = useCallback(
    async (payload) => {
      const data = await api.register(payload);
      persist(data.user, data.token);
      return data.user;
    },
    [persist]
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("devbhakt_token");
    localStorage.removeItem("devbhakt_user");
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const data = await api.getProfile();
      setUser(data.user);
      localStorage.setItem("devbhakt_user", JSON.stringify(data.user));
      return data.user;
    } catch {
      return null;
    }
  }, []);

  const updateUser = useCallback((nextUser) => {
    setUser(nextUser);
    localStorage.setItem("devbhakt_user", JSON.stringify(nextUser));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        isAdmin: user?.role === "admin",
        login,
        register,
        logout,
        refreshProfile,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

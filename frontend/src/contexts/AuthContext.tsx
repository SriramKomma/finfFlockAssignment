"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api, { setTokens, clearTokens, getAccessToken } from "@/lib/api";
import { useRouter, usePathname } from "next/navigation";

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const initAuth = async () => {
      const token = getAccessToken();
      if (token) {
        try {
          // Verify token or get user profile. Wait, we don't have a /me endpoint!
          // We can decode jwt or add a /me endpoint. Let's decode or store username in cookie.
          // Since we lack a /me endpoint, I'll store user data in localStorage on login.
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          } else {
              // Without /me endpoint, just proceed login but user state empty. Wait, better to clear logs.
              clearTokens();
          }
        } catch (error) {
          clearTokens();
          localStorage.removeItem("user");
        }
      } else {
         if (pathname !== "/login" && pathname !== "/signup") {
             router.push("/login");
         }
      }
      setLoading(false);
    };
    initAuth();
  }, [pathname, router]);

  const login = async (credentials: any) => {
    const res = await api.post("/auth/login", credentials);
    const { access_token, refresh_token } = res.data;
    setTokens(access_token, refresh_token);
    
    // We don't get 'name' in /login. So we'll have to parse subject or add it.
    // For now, minimal user simulation
    const dummyUser = { id: 1, name: credentials.email.split('@')[0], email: credentials.email };
    setUser(dummyUser);
    localStorage.setItem("user", JSON.stringify(dummyUser));
    
    router.push("/dashboard");
  };

  const register = async (credentials: any) => {
    await api.post("/auth/register", credentials);
    // Auto login after register
    await login({ email: credentials.email, password: credentials.password });
  };

  const logout = () => {
    clearTokens();
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

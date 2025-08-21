"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import Cookies from "js-cookie";

export interface User {
  id: number;
  email?: string;
  created_at: string;
  wallets: Array<{
    address: string;
    chain: string;
    created_at: string;
  }>;
  exchange_keys_count: number;
  copy_subscriptions_count: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
}

interface AuthContextType extends AuthState {
  login: (token: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Use local API routes to avoid CORS issues
const API_URL = "/api";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    accessToken: null,
  });

  // Initialize auth state from cookie
  useEffect(() => {
    const initAuth = async () => {
      const token = Cookies.get("access_token");
      if (token) {
        try {
          await fetchUserProfile(token);
        } catch (error) {
          console.error("Failed to initialize auth:", error);
          Cookies.remove("access_token");
        }
      }
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    };

    initAuth();
  }, []);

  const fetchUserProfile = async (token: string) => {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch user profile");
    }

    const user = await response.json();
    setAuthState({
      user,
      isAuthenticated: true,
      isLoading: false,
      accessToken: token,
    });
  };

  const login = async (token: string) => {
    Cookies.set("access_token", token, { expires: 7 }); // 7 days
    await fetchUserProfile(token);
  };

  const logout = async () => {
    try {
      const token = Cookies.get("access_token");
      if (token) {
        await fetch(`${API_URL}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      Cookies.remove("access_token");
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        accessToken: null,
      });
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const token = Cookies.get("access_token");
      if (!token) return false;

      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) return false;

      const data = await response.json();
      Cookies.set("access_token", data.access_token, { expires: 7 });
      setAuthState((prev) => ({ ...prev, accessToken: data.access_token }));
      return true;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { User, userService, AuthResponse } from "@/services/user.service";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    name?: string,
  ) => Promise<AuthResponse>;
  confirmSignup: (email: string, confirmationCode: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** GET /auth/me — Cognito login không trả `user` trong body, cần gọi sau khi có token. */
  const hydrateUserFromSession = useCallback(async (): Promise<User | null> => {
    if (!userService.isAuthenticated()) {
      return null;
    }
    const profile = await userService.getProfile();
    if (profile) {
      setUser(profile);
      return profile;
    }
    return null;
  }, []);

  // Load user on mount if authenticated (full page load / reload).
  useEffect(() => {
    async function loadUser() {
      if (userService.isAuthenticated()) {
        setIsLoading(true);
        try {
          const profile = await hydrateUserFromSession();
          if (!profile) {
            userService.logout();
          }
        } finally {
          setIsLoading(false);
        }
      }
    }
    void loadUser();
  }, [hydrateUserFromSession]);

  const login = useCallback(
    async (email: string, password: string) => {
      setError(null);
      setIsLoading(true);
      try {
        const response = await userService.login(email, password);
        if (response.user) {
          setUser(response.user);
        } else {
          await hydrateUserFromSession();
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Login failed";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [hydrateUserFromSession],
  );

  const register = useCallback(
    async (email: string, password: string, name?: string) => {
      setError(null);
      setIsLoading(true);
      try {
        const response = await userService.register(email, password, name);
        if (response.user) {
          setUser(response.user);
        } else if (userService.isAuthenticated()) {
          await hydrateUserFromSession();
        }
        return response;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Registration failed";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [hydrateUserFromSession],
  );

  const confirmSignup = useCallback(
    async (email: string, confirmationCode: string) => {
      setError(null);
      setIsLoading(true);
      try {
        await userService.confirmSignup(email, confirmationCode);
        if (userService.isAuthenticated()) {
          await hydrateUserFromSession();
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Confirmation failed";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [hydrateUserFromSession],
  );

  const logout = useCallback(() => {
    setUser(null);
    setError(null);
    userService.logout();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user && userService.isAuthenticated(),
    login,
    register,
    confirmSignup,
    logout,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

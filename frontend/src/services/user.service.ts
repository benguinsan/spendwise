import { api } from "@/lib/api";

export interface User {
  id: string;
  email: string;
  name?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  provider: string;
  user?: User;
  userConfirmed: boolean;
  message?: string;
  idToken?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
}

function setTokenCookie(token: string, expiresIn?: number) {
  if (typeof document === "undefined") return;

  const expires = expiresIn
    ? new Date(Date.now() + expiresIn * 1000).toUTCString()
    : "";

  document.cookie = `auth_token=${token}; path=/; ${expires ? `expires=${expires};` : ""} SameSite=Strict`;
}

function removeTokenCookie() {
  if (typeof document === "undefined") return;
  document.cookie =
    "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
}

export const userService = {
  async register(
    email: string,
    password: string,
    name?: string,
  ): Promise<AuthResponse> {
    const response = await api.auth.register({ email, password, name });
    if (response.idToken) {
      localStorage.setItem("auth_token", response.idToken);
      setTokenCookie(response.idToken, response.expiresIn);
    }
    return response;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.auth.login({ email, password });
    if (response.idToken) {
      localStorage.setItem("auth_token", response.idToken);
      setTokenCookie(response.idToken, response.expiresIn);
    }
    if (response.accessToken) {
      localStorage.setItem("access_token", response.accessToken);
    }
    return response;
  },

  async confirmSignup(
    email: string,
    confirmationCode: string,
  ): Promise<AuthResponse> {
    const response = await api.auth.confirmSignup({ email, confirmationCode });
    if (response.idToken) {
      localStorage.setItem("auth_token", response.idToken);
      setTokenCookie(response.idToken, response.expiresIn);
    }
    return response;
  },

  async getCognitoProfile(): Promise<User> {
    return await api.auth.getCognitoProfile();
  },

  async getProfile(): Promise<User | null> {
    try {
      const profile = await api.auth.getCognitoProfile();
      return profile;
    } catch {
      return null;
    }
  },

  getAuthToken(): string | null {
    if (typeof window === "undefined") {
      return null;
    }
    return localStorage.getItem("auth_token");
  },

  logout(): void {
    if (typeof window === "undefined") {
      return;
    }
    localStorage.removeItem("auth_token");
    localStorage.removeItem("access_token");
    removeTokenCookie();
  },

  isAuthenticated(): boolean {
    return this.getAuthToken() !== null;
  },
};

export default userService;

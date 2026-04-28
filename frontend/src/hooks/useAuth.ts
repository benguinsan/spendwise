import { useMutation, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { authApi } from "@api/auth.api";
import { useAuthStore } from "@stores/auth.store";
import {
  LoginRequest,
  RegisterRequest,
  User,
  RefreshTokenRequest,
} from "@types";

export const useLogin = () => {
  const { setAuthResponse } = useAuthStore();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (data) => {
      setAuthResponse(data);
    },
  });
};

export const useRegister = () => {
  const { setAuthResponse } = useAuthStore();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (data) => {
      setAuthResponse(data);
    },
  });
};

export const useRefreshToken = () => {
  const { setTokens } = useAuthStore();

  return useMutation({
    mutationFn: (data: RefreshTokenRequest) => authApi.refresh(data),
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
    },
  });
};

export const useLogout = () => {
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      logout();
    },
  });
};

export const useCurrentUser = (
  options?: Omit<UseQueryOptions<User>, "queryKey" | "queryFn">,
) => {
  return useQuery<User>({
    queryKey: ["auth", "me"],
    queryFn: () => authApi.getCurrentUser(),
    ...options,
  });
};

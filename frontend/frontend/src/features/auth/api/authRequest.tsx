import { fetchAPI } from "@/utils/fetchHelper";
import type { User } from "@/types/types";

export interface AuthResponse {
  user: User;
}

export const registerRequest = (data: User) => {
  return fetchAPI<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const loginRequest = (data: User) => {
  return fetchAPI<AuthResponse>(`/auth/login`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const verifyRequest = () => fetchAPI<AuthResponse>(`/auth/verify`);

export const logoutRequest = () =>
  fetchAPI<AuthResponse>(`/auth/logout`, {
    method: "POST",
  });

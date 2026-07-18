import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

/**
 * Base URL sourced from VITE_API_BASE_URL.
 * Swap the mock services (src/services/*.ts) to point at real Spring Boot endpoints —
 * the axios client, interceptors, and hooks below remain unchanged.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

export const TOKEN_STORAGE_KEY = 'aurelia.hms.token';
export const USER_STORAGE_KEY = 'aurelia.hms.user';

export function getStoredToken(): string | null {
  return sessionStorage.getItem(TOKEN_STORAGE_KEY);
}

export function getStoredUser(): string | null {
  return sessionStorage.getItem(USER_STORAGE_KEY);
}

export function setStoredSession(token: string, user: string) {
  sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
  sessionStorage.setItem(USER_STORAGE_KEY, user);
}

export function clearStoredSession() {
  sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  sessionStorage.removeItem(USER_STORAGE_KEY);
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStoredToken();
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ?? error.message ?? 'Unexpected error occurred';

    if (status === 401) {
      clearStoredSession();
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(
      Object.assign(new Error(message), {
        status,
        isApiError: true,
        original: error,
      })
    );
  }
);
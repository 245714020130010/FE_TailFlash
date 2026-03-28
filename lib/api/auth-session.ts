import type { AuthUser } from "@/lib/api/types";

const ACCESS_TOKEN_KEY = "tailflash-access-token";
const REFRESH_TOKEN_KEY = "tailflash-refresh-token";
const AUTH_USER_KEY = "tailflash-auth-user";
export const AUTH_SESSION_CHANGED_EVENT = "tailflash-auth-session-changed";

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

export function saveAuthSession(input: {
  accessToken: string;
  refreshToken: string;
  user?: AuthUser;
}): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(ACCESS_TOKEN_KEY, input.accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, input.refreshToken);
  if (input.user) {
    window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(input.user));
  }
  dispatchAuthSessionChangedEvent();
}

export function clearAuthSession(): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_USER_KEY);
  dispatchAuthSessionChangedEvent();
}

export function getAccessToken(): string | null {
  if (!canUseStorage()) {
    return null;
  }

  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (!canUseStorage()) {
    return null;
  }

  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getAuthUser(): AuthUser | null {
  if (!canUseStorage()) {
    return null;
  }

  const serialized = window.localStorage.getItem(AUTH_USER_KEY);
  if (!serialized) {
    return null;
  }

  try {
    return JSON.parse(serialized) as AuthUser;
  } catch {
    window.localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
}

export function saveAuthUser(user: AuthUser): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  dispatchAuthSessionChangedEvent();
}

export function isAuthenticatedByToken(): boolean {
  return Boolean(getAccessToken());
}

function dispatchAuthSessionChangedEvent(): void {
  if (!canUseStorage()) {
    return;
  }

  window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
}

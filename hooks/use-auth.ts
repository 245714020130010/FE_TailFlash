"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/api/auth-client";
import {
  AUTH_SESSION_CHANGED_EVENT,
  getAuthUser,
  isAuthenticatedByToken,
} from "@/lib/api/auth-session";
import { isDemoModeEnabled } from "@/lib/api/http-client";
import { readDemoState, subscribeDemoState } from "@/lib/demo-store";
import type { AuthUser } from "@/lib/api/types";

export function useAuth() {
  const [isAuthReady, setIsAuthReady] = useState(() => isDemoModeEnabled());
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (isDemoModeEnabled()) {
      return readDemoState().session.isLoggedIn;
    }

    return isAuthenticatedByToken();
  });
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    if (isDemoModeEnabled()) {
      const state = readDemoState();
      return {
        id: 1,
        email: state.profile.email,
        displayName: state.profile.fullName,
        role: state.profile.role.toUpperCase(),
        emailVerified: true,
      };
    }

    return getAuthUser();
  });

  useEffect(() => {
    if (isDemoModeEnabled()) {
      const updateFromDemoStore = () => {
        const state = readDemoState();
        setIsAuthenticated(state.session.isLoggedIn);
        setCurrentUser({
          id: 1,
          email: state.profile.email,
          displayName: state.profile.fullName,
          role: state.profile.role.toUpperCase(),
          emailVerified: true,
        });
        setIsAuthReady(true);
      };

      updateFromDemoStore();
      return subscribeDemoState(updateFromDemoStore);
    }

    const refreshFromSession = () => {
      setIsAuthenticated(isAuthenticatedByToken());
      setCurrentUser(getAuthUser());
      setIsAuthReady(true);
    };

    refreshFromSession();

    const handleSessionChange = () => {
      refreshFromSession();
    };

    window.addEventListener(AUTH_SESSION_CHANGED_EVENT, handleSessionChange);
    window.addEventListener("storage", handleSessionChange);

    if (isAuthenticatedByToken() && !getAuthUser()) {
      void authClient.me().catch(() => {
        refreshFromSession();
      });
    }

    return () => {
      window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, handleSessionChange);
      window.removeEventListener("storage", handleSessionChange);
    };
  }, []);

  const isAdmin = currentUser?.role === "ADMIN";

  return {
    isAuthReady,
    isAuthenticated,
    currentUser,
    isAdmin,
    login: authClient.login,
    register: authClient.register,
    logout: authClient.logout,
    me: authClient.me,
    forgotPassword: authClient.forgotPassword,
    resetPassword: authClient.resetPassword,
    changePassword: authClient.changePassword,
    refreshToken: authClient.refreshToken,
  };
}

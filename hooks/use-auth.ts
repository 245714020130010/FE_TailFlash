"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/api/auth-client";
import { isAuthenticatedByToken } from "@/lib/api/auth-session";
import { isDemoModeEnabled } from "@/lib/api/http-client";
import { readDemoState, subscribeDemoState } from "@/lib/demo-store";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (isDemoModeEnabled()) {
      return readDemoState().session.isLoggedIn;
    }

    return isAuthenticatedByToken();
  });

  useEffect(() => {
    if (isDemoModeEnabled()) {
      const updateFromDemoStore = () => {
        const state = readDemoState();
        setIsAuthenticated(state.session.isLoggedIn);
      };

      updateFromDemoStore();
      return subscribeDemoState(updateFromDemoStore);
    }

    return undefined;
  }, []);

  return {
    isAuthenticated,
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

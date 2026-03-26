import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  saveAuthSession,
} from "@/lib/api/auth-session";
import { isDemoModeEnabled, requestJson } from "@/lib/api/http-client";
import {
  readDemoState,
  signOutAllDemoSessions,
  updateDemoState,
} from "@/lib/demo-store";
import {
  ApiClientError,
  type AuthTokenData,
  type AuthUser,
  type MessageData,
} from "@/lib/api/types";

interface RegisterInput {
  email: string;
  password: string;
  displayName: string;
  role: "LEARNER" | "TEACHER";
}

interface LoginInput {
  email: string;
  password: string;
}

interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

function createDemoTokenData(input: {
  email: string;
  displayName: string;
  role: string;
}): AuthTokenData {
  const now = Date.now();
  return {
    accessToken: `demo-access-${now}`,
    refreshToken: `demo-refresh-${now}`,
    tokenType: "Bearer",
    expiresInSeconds: 900,
    user: {
      id: 1,
      email: input.email,
      displayName: input.displayName,
      role: input.role,
      emailVerified: true,
    },
  };
}

export const authClient = {
  async register(input: RegisterInput): Promise<AuthTokenData> {
    if (isDemoModeEnabled()) {
      const nextState = updateDemoState((current) => ({
        ...current,
        profile: {
          ...current.profile,
          fullName: input.displayName,
          email: input.email,
          role: input.role === "TEACHER" ? "teacher" : "learner",
        },
        session: {
          isLoggedIn: true,
          email: input.email,
          provider: "password",
        },
      }));

      const tokenData = createDemoTokenData({
        email: nextState.profile.email,
        displayName: nextState.profile.fullName,
        role: nextState.profile.role.toUpperCase(),
      });
      saveAuthSession({ accessToken: tokenData.accessToken, refreshToken: tokenData.refreshToken });
      return tokenData;
    }

    const data = await requestJson<AuthTokenData>("/api/v1/auth/register", {
      method: "POST",
      body: input,
    });
    saveAuthSession({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    return data;
  },

  async login(input: LoginInput): Promise<AuthTokenData> {
    if (isDemoModeEnabled()) {
      const nextState = updateDemoState((current) => ({
        ...current,
        profile: {
          ...current.profile,
          email: input.email,
        },
        session: {
          isLoggedIn: true,
          email: input.email,
          provider: "password",
        },
      }));

      const tokenData = createDemoTokenData({
        email: nextState.profile.email,
        displayName: nextState.profile.fullName,
        role: nextState.profile.role.toUpperCase(),
      });
      saveAuthSession({ accessToken: tokenData.accessToken, refreshToken: tokenData.refreshToken });
      return tokenData;
    }

    const data = await requestJson<AuthTokenData>("/api/v1/auth/login", {
      method: "POST",
      body: input,
    });
    saveAuthSession({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    return data;
  },

  async refreshToken(): Promise<AuthTokenData> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new ApiClientError({ code: "AUTH_UNAUTHENTICATED", message: "No refresh token" });
    }

    if (isDemoModeEnabled()) {
      const current = readDemoState();
      const tokenData = createDemoTokenData({
        email: current.profile.email,
        displayName: current.profile.fullName,
        role: current.profile.role.toUpperCase(),
      });
      saveAuthSession({ accessToken: tokenData.accessToken, refreshToken: tokenData.refreshToken });
      return tokenData;
    }

    const data = await requestJson<AuthTokenData>("/api/v1/auth/refresh-token", {
      method: "POST",
      body: { refreshToken },
    });
    saveAuthSession({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    return data;
  },

  async me(): Promise<AuthUser> {
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

    const accessToken = getAccessToken();
    return requestJson<AuthUser>("/api/v1/auth/me", {
      method: "GET",
      accessToken,
    });
  },

  async logout(): Promise<MessageData> {
    const refreshToken = getRefreshToken();

    if (isDemoModeEnabled()) {
      signOutAllDemoSessions();
      clearAuthSession();
      return { message: "Logged out" };
    }

    if (refreshToken) {
      await requestJson<MessageData>("/api/v1/auth/logout", {
        method: "POST",
        body: { refreshToken },
      });
    }

    clearAuthSession();
    return { message: "Logged out" };
  },

  async forgotPassword(email: string): Promise<MessageData> {
    if (isDemoModeEnabled()) {
      return { message: "Đã gửi hướng dẫn khôi phục trong chế độ demo" };
    }

    return requestJson<MessageData>("/api/v1/auth/forgot-password", {
      method: "POST",
      body: { email },
    });
  },

  async resetPassword(input: ResetPasswordInput): Promise<MessageData> {
    if (isDemoModeEnabled()) {
      return { message: "Đặt lại mật khẩu demo thành công" };
    }

    return requestJson<MessageData>("/api/v1/auth/reset-password", {
      method: "POST",
      body: input,
    });
  },

  async changePassword(input: ChangePasswordInput): Promise<MessageData> {
    if (isDemoModeEnabled()) {
      return { message: "Cập nhật mật khẩu demo thành công" };
    }

    const accessToken = getAccessToken();
    return requestJson<MessageData>("/api/v1/auth/change-password", {
      method: "POST",
      accessToken,
      body: input,
    });
  },
};

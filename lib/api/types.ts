export interface ApiErrorPayload {
  code: string;
  message: string;
  details: Record<string, unknown>;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T | null;
  error: ApiErrorPayload | null;
}

export class ApiClientError extends Error {
  code: string;
  status?: number;
  details?: Record<string, unknown>;

  constructor(input: {
    code: string;
    message: string;
    status?: number;
    details?: Record<string, unknown>;
  }) {
    super(input.message);
    this.name = "ApiClientError";
    this.code = input.code;
    this.status = input.status;
    this.details = input.details;
  }
}

export interface AuthUser {
  id: number;
  email: string;
  displayName: string;
  role: string;
  emailVerified: boolean;
}

export interface AuthTokenData {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInSeconds: number;
  user: AuthUser;
}

export interface MessageData {
  message: string;
}

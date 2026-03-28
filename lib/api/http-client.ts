import { ApiClientError, type ApiEnvelope } from "@/lib/api/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "http://localhost:8080";

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  accessToken?: string | null;
}

export async function requestJson<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (options.accessToken) {
    headers.set("Authorization", `Bearer ${options.accessToken}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const json = (await response.json()) as ApiEnvelope<T>;

  if (!response.ok || !json.success || json.data === null) {
    const error = json.error;
    throw new ApiClientError({
      code: error?.code ?? "SYSTEM_INTERNAL_ERROR",
      message: error?.message ?? "Request failed",
      details: error?.details,
      status: response.status,
    });
  }

  return json.data;
}

export function isDemoModeEnabled(): boolean {
  const rawValue = process.env.NEXT_PUBLIC_DEMO_MODE?.trim().toLowerCase();
  return rawValue === "true" || rawValue === "1";
}

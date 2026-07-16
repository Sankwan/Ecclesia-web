"use client";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

/** Client-side fetch wrapper. Never touches a token directly — everything
 *  routes through /api/proxy/*, which injects the httpOnly-cookie bearer. */
export async function apiFetch<T = unknown>(
  path: string,
  options: { method?: string; body?: unknown; idempotencyKey?: string } = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (options.idempotencyKey) headers["Idempotency-Key"] = options.idempotencyKey;

  const res = await fetch(`/api/proxy/${path.replace(/^\//, "")}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new ApiError(res.status, data?.error?.code ?? "UNKNOWN_ERROR", data?.error?.message ?? "Something went wrong");
  }
  return data as T;
}

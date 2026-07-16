import "server-only";
import { BACKEND_URL } from "@/lib/backend";
import { getRefreshToken, getToken, setSessionTokens } from "@/lib/session";

export class ServerApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

/** Authenticated fetch for Server Components — talks to the Nest API directly
 *  (no need to hop through /api/proxy since we already have the cookie here).
 *  Refreshes the access token once on a 401, mirroring the proxy route. */
export async function serverApiFetch<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const run = async (token?: string) =>
    fetch(`${BACKEND_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
      cache: "no-store",
    });

  let token = await getToken();
  let res = await run(token);

  if (res.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) res = await run(refreshed);
  }

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new ServerApiError(res.status, data?.error?.code ?? "UNKNOWN_ERROR", data?.error?.message ?? `Request failed (${res.status})`);
  }
  return data as T;
}

async function tryRefresh(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;
  try {
    const res = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    await setSessionTokens(data.accessToken, data.refreshToken);
    return data.accessToken as string;
  } catch {
    return null;
  }
}

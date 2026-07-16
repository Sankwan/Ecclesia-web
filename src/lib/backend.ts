import "server-only";

export const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3000/api/v1";

export class BackendError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

/** Server-only fetch straight to the Nest API. Throws BackendError with the
 *  {error:{code,message}} envelope our backend always returns on failure. */
export async function backendFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
  });

  const text = await res.text();
  const body = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const code = body?.error?.code ?? "UNKNOWN_ERROR";
    const message = body?.error?.message ?? `Request failed (${res.status})`;
    throw new BackendError(res.status, code, message);
  }
  return body;
}

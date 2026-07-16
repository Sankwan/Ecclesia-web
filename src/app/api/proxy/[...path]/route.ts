import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/backend";
import { getRefreshToken, getToken, setSessionTokens } from "@/lib/session";

/**
 * Authenticated BFF proxy: client code calls /api/proxy/<backend path> instead
 * of hitting the Nest API directly, so the JWT never touches browser JS
 * (it lives only in the httpOnly cc_token cookie). On a 401 we attempt one
 * silent refresh-and-retry before giving up.
 */
async function handle(request: NextRequest, path: string[]) {
  const target = `${BACKEND_URL}/${path.join("/")}${request.nextUrl.search}`;
  const body = request.method === "GET" || request.method === "HEAD" ? undefined : await request.text();

  const forward = (token?: string) => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    const idem = request.headers.get("idempotency-key");
    if (idem) headers["Idempotency-Key"] = idem;
    return fetch(target, { method: request.method, headers, body, cache: "no-store" });
  };

  const token = await getToken();
  let res = await forward(token);

  if (res.status === 401 && token) {
    const refreshed = await tryRefresh();
    if (refreshed) res = await forward(refreshed);
  }

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
  });
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

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, ctx: Ctx) {
  return handle(request, (await ctx.params).path);
}
export async function POST(request: NextRequest, ctx: Ctx) {
  return handle(request, (await ctx.params).path);
}
export async function PATCH(request: NextRequest, ctx: Ctx) {
  return handle(request, (await ctx.params).path);
}
export async function PUT(request: NextRequest, ctx: Ctx) {
  return handle(request, (await ctx.params).path);
}
export async function DELETE(request: NextRequest, ctx: Ctx) {
  return handle(request, (await ctx.params).path);
}

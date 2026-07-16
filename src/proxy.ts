import { NextRequest, NextResponse } from "next/server";

// Local, dependency-free decode: avoids pulling lib/session's "server-only" +
// next/headers import chain into the proxy bundle. Signature isn't verified
// here — this is an optimistic check only; the Nest API re-verifies every
// real request.
function decodeJwt(token: string): { type?: string; exp?: number } | null {
  try {
    const [, payload] = token.split(".");
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

// Optimistic route guard (Next 16 renamed Middleware -> Proxy). Reads the
// cookie only — no backend round trip — per Next's own guidance for
// proxy-level auth checks. The Nest API re-verifies every real request.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("cc_token")?.value;
  const payload = token ? decodeJwt(token) : null;
  const notExpired = !!payload?.exp && payload.exp * 1000 > Date.now();
  const isAccess = payload?.type === "access" && notExpired;
  const isRegistration = payload?.type === "registration" && notExpired;

  if (pathname.startsWith("/app") && !isAccess) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (pathname === "/register") {
    if (isAccess) return NextResponse.redirect(new URL("/app", request.url));
    if (!isRegistration) return NextResponse.redirect(new URL("/login", request.url));
  }
  if (pathname === "/login" && isAccess) {
    return NextResponse.redirect(new URL("/app", request.url));
  }
  if (pathname === "/login" && isRegistration) {
    return NextResponse.redirect(new URL("/register", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/login", "/register"],
};

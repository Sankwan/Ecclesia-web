import "server-only";
import { cookies } from "next/headers";

export type Role = "CHURCH_ADMIN" | "PROVIDER" | "PLATFORM_ADMIN";
type TokenType = "access" | "refresh" | "registration";

export interface JwtPayload {
  sub: string | null;
  phone: string;
  role?: Role;
  type: TokenType;
  exp: number;
}

const TOKEN_COOKIE = "cc_token";
const REFRESH_COOKIE = "cc_refresh";
const isProd = process.env.NODE_ENV === "production";

const cookieOpts = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax" as const,
  path: "/",
};

/** Decodes the JWT payload without verifying the signature — used only for
 *  optimistic UI/role branching. The Nest backend is the real authority and
 *  verifies every request independently. */
export function decodeJwt(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split(".");
    const json = Buffer.from(payload, "base64url").toString("utf8");
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export async function setSessionTokens(token: string, refreshToken?: string | null) {
  const store = await cookies();
  store.set(TOKEN_COOKIE, token, cookieOpts);
  if (refreshToken) {
    store.set(REFRESH_COOKIE, refreshToken, cookieOpts);
  }
}

export async function clearSessionTokens() {
  const store = await cookies();
  store.delete(TOKEN_COOKIE);
  store.delete(REFRESH_COOKIE);
}

export async function getToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(TOKEN_COOKIE)?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(REFRESH_COOKIE)?.value;
}

export interface Session {
  userId: string;
  phone: string;
  role: Role;
}

/** For Server Components: the current signed-in user, or null. Only trusts
 *  tokens of type "access" — a pending registration token never counts as
 *  a session. */
export async function getSession(): Promise<Session | null> {
  const token = await getToken();
  if (!token) return null;
  const payload = decodeJwt(token);
  if (!payload || payload.type !== "access" || !payload.sub || !payload.role) return null;
  if (payload.exp * 1000 < Date.now()) return null;
  return { userId: payload.sub, phone: payload.phone, role: payload.role };
}

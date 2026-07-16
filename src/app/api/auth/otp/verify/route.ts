import { NextResponse } from "next/server";
import { backendFetch, BackendError } from "@/lib/backend";
import { setSessionTokens } from "@/lib/session";

export async function POST(request: Request) {
  const body = await request.json();
  try {
    const data = await backendFetch("/auth/otp/verify", {
      method: "POST",
      body: JSON.stringify(body),
    });
    // Always store the returned bearer — it's either a real access token
    // (existing user) or a short-lived registration token (new user).
    await setSessionTokens(data.accessToken, data.refreshToken);
    return NextResponse.json({ isNewUser: data.isNewUser });
  } catch (e) {
    if (e instanceof BackendError) {
      return NextResponse.json({ error: { code: e.code, message: e.message } }, { status: e.status });
    }
    return NextResponse.json({ error: { code: "PROXY_ERROR", message: "Could not reach the server" } }, { status: 502 });
  }
}

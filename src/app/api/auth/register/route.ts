import { NextResponse } from "next/server";
import { backendFetch, BackendError } from "@/lib/backend";
import { getToken, setSessionTokens } from "@/lib/session";

export async function POST(request: Request) {
  const body = await request.json();
  const registrationToken = await getToken();
  if (!registrationToken) {
    return NextResponse.json(
      { error: { code: "TOKEN_MISSING", message: "Verify your phone again first" } },
      { status: 401 },
    );
  }

  try {
    const data = await backendFetch("/auth/register", {
      method: "POST",
      headers: { Authorization: `Bearer ${registrationToken}` },
      body: JSON.stringify(body),
    });
    await setSessionTokens(data.accessToken, data.refreshToken);
    return NextResponse.json({ user: data.user });
  } catch (e) {
    if (e instanceof BackendError) {
      return NextResponse.json({ error: { code: e.code, message: e.message } }, { status: e.status });
    }
    return NextResponse.json({ error: { code: "PROXY_ERROR", message: "Could not reach the server" } }, { status: 502 });
  }
}

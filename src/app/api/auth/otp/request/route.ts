import { NextResponse } from "next/server";
import { backendFetch, BackendError } from "@/lib/backend";

export async function POST(request: Request) {
  const body = await request.json();
  try {
    const data = await backendFetch("/auth/otp/request", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return NextResponse.json(data);
  } catch (e) {
    if (e instanceof BackendError) {
      return NextResponse.json({ error: { code: e.code, message: e.message } }, { status: e.status });
    }
    return NextResponse.json({ error: { code: "PROXY_ERROR", message: "Could not reach the server" } }, { status: 502 });
  }
}

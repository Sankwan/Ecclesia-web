import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function AppHome() {
  const session = await getSession();
  redirect(session?.role === "PROVIDER" ? "/app/provider" : "/app/church");
}

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function AppHome() {
  const session = await getSession();
  if (session?.role === "PROVIDER") redirect("/app/provider");
  if (session?.role === "PLATFORM_ADMIN") redirect("/app/admin");
  redirect("/app/church");
}

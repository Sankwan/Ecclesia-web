import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/components/logout-button";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const homeHref = session.role === "PROVIDER" ? "/app/provider" : "/app/church";
  const navLinks =
    session.role === "PROVIDER"
      ? [
          { href: "/app/provider", label: "Feed" },
          { href: "/app/provider/profile", label: "My profile" },
        ]
      : [{ href: "/app/church", label: "My churches" }];

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-paper/85 px-6 py-4 backdrop-blur md:px-10">
        <div className="flex items-center gap-8">
          <Link href={homeHref} className="font-display text-lg font-semibold">
            ChurchConnect
          </Link>
          <nav className="hidden gap-6 md:flex">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <LogoutButton />
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8 md:px-10">{children}</main>
    </div>
  );
}

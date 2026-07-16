"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export function AdminTabs({ pendingCount }: { pendingCount: number }) {
  const pathname = usePathname();
  const tabs = [
    { href: "/app/admin", label: "Worklist", exact: true },
    { href: "/app/admin/verifications", label: "Verifications", badge: pendingCount },
    { href: "/app/admin/providers", label: "Providers" },
    { href: "/app/admin/churches", label: "Churches" },
    { href: "/app/admin/bookings", label: "Bookings" },
    { href: "/app/admin/metrics", label: "Metrics" },
  ];

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-line">
      {tabs.map((t) => {
        const active = t.exact ? pathname === t.href : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={clsx(
              "-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors",
              active ? "border-clay text-clay" : "border-transparent text-ink-soft hover:text-ink",
            )}
          >
            {t.label}
            {t.badge ? (
              <span className="rounded-full bg-emergency px-1.5 py-0.5 text-xs font-semibold text-white">
                {t.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

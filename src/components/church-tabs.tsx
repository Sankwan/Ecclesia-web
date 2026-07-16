"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export function ChurchTabs({ churchId }: { churchId: string }) {
  const pathname = usePathname();
  const base = `/app/church/${churchId}`;
  const tabs = [
    { href: base, label: "Overview", exact: true },
    { href: `${base}/requests`, label: "Requests" },
    { href: `${base}/members`, label: "Members" },
    { href: `${base}/messages`, label: "Messages" },
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
              "-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors",
              active
                ? "border-clay text-clay"
                : "border-transparent text-ink-soft hover:text-ink",
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}

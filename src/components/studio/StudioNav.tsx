"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/studio", label: "Dashboard" },
  { href: "/studio/releases", label: "Music" },
  { href: "/studio/events", label: "Live" },
  { href: "/studio/journal", label: "Journal" },
  { href: "/studio/archive", label: "Archive" },
  { href: "/studio/alchemy", label: "Alchemy" },
  { href: "/studio/collaborators", label: "Collaborators" },
  { href: "/studio/media", label: "Media & provenance" },
  { href: "/studio/enquiries", label: "Enquiries" },
  { href: "/studio/settings", label: "Site settings" },
];

export function StudioNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const all = isAdmin ? [...items, { href: "/studio/team", label: "Team" }] : items;
  const active = (href: string) =>
    href === "/studio" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`) || (href === "/studio/releases" && pathname.startsWith("/studio/tracks"));
  return (
    <nav aria-label="Studio" className="overflow-x-auto px-3 pb-3 lg:overflow-visible lg:pb-0">
      <ul className="flex gap-1 lg:flex-col">
        {all.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active(item.href) ? "page" : undefined}
              className={`block whitespace-nowrap px-3 py-2 text-sm transition-colors ${
                active(item.href) ? "bg-charcoal text-copper" : "text-silver hover:bg-charcoal hover:text-bone"
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

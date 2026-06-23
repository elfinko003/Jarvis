"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "OVERVIEW", href: "/command-center" },
  { label: "MÄRKTE", href: "/markets" },
  { label: "PIPELINE", href: "/pipeline" },
  { label: "SATELLIT", href: "/world-globe" },
  { label: "MORNING", href: "/morning" },
];

export function CommandCenterTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-5">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`border-b-2 pb-1 font-mono text-[11px] uppercase tracking-[2px] transition-colors ${
              active
                ? "border-orange text-orange [text-shadow:0_0_8px_var(--orange)]"
                : "border-transparent text-text-dim hover:text-orange-bright"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

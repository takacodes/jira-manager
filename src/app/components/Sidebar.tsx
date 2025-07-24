"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menu = [
  { name: "Task", href: "/" },
  { name: "Time Spent", href: "/diagram" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={`bg-[var(--card)] border-r border-[var(--border)] transition-all duration-300 h-screen fixed top-0 left-0 z-20 ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      <div className="flex items-center justify-between px-4 py-4">
        <span className={`font-bold text-[var(--accent)] text-xl transition-all duration-300 ${collapsed && "hidden"}`}>
        </span>
        <button
          className="text-[var(--accent)] focus:outline-none"
          onClick={() => setCollapsed((v) => !v)}
          aria-label="Toggle sidebar"
        >
          {collapsed ? "»" : "«"}
        </button>
      </div>
      <nav className="mt-8 flex flex-col gap-2">
        {menu.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-6 py-2 rounded-l-full transition-colors ${
              pathname === item.href
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--foreground)] hover:bg-[var(--border)]"
            } ${collapsed && "px-2 text-center"}`}
          >
            {collapsed ? item.name[0] : item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

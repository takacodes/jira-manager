"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menu = [
  { name: "Task", href: "/" },
  { name: "Time Spent (Personnel)", href: "/timespent" },
  { name: "Time Spent (Task)", href: "/timespent/task" },
  { name: "Personnel", href: "/personnel" },
  { name: "Settings", href: "/settings" },
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
          className="text-[var(--accent)] bg-[var(--border)] hover:bg-[var(--accent)] hover:text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl shadow focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all duration-200"
          style={{ minWidth: 40, minHeight: 40 }}
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

// app/dashboard/layout.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Welcome", href: "/dashboard" },
    { name: "Kanban", href: "/dashboard/kanban" },
    { name: "Calendar", href: "/dashboard/calendar" },
    { name: "Settings", href: "/dashboard/settings" },
  ];

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="p-6 text-xl font-bold">PathWise</div>
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-lg ${
                pathname === item.href
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 bg-gray-50 flex flex-col">
        {/* Topbar */}
        <header className="h-14 bg-white border-b flex items-center justify-between px-6">
          <h1 className="font-semibold text-lg">Dashboard</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Hi, User</span>
            <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </main>
    </div>
  );
}

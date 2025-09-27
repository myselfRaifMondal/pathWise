// frontend/app/dashboard/layout.tsx
"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/dashboard";
  const active = (p: string) => pathname.startsWith(p) ? "bg-blue-50 border-blue-500" : "hover:bg-gray-50";

  return (
    <div className="flex gap-6">
      {/* Left column - nav */}
      <aside className="w-64 sticky top-20 self-start">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="mb-4">
            <h2 className="text-lg font-bold">Dashboard</h2>
            <p className="text-sm text-gray-500">Overview & tools</p>
          </div>

          <nav className="space-y-2">
            <Link href="/dashboard" className={`block px-3 py-2 rounded border ${active("/dashboard")}`}>Welcome</Link>
            <Link href="/dashboard/kanban" className={`block px-3 py-2 rounded border ${active("/dashboard/kanban")}`}>Kanban</Link>
            <Link href="/dashboard/calendar" className={`block px-3 py-2 rounded border ${active("/dashboard/calendar")}`}>Calendar</Link>
            <Link href="/dashboard/settings" className={`block px-3 py-2 rounded border ${active("/dashboard/settings")}`}>Settings</Link>
          </nav>
        </div>

        <div className="mt-4">
          {/* quick action */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="font-semibold text-sm mb-2">Quick Actions</h4>
            <Link href="/dashboard" className="block">
              <button className="w-full bg-blue-600 text-white py-2 rounded">+ Add Application</button>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <section className="flex-1">
        {children}
      </section>
    </div>
  );
}

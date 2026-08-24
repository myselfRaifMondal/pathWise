// frontend/app/dashboard/calendar/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import { fetchJSON, API_BASE } from "../../../lib/api";

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export default function CalendarPage() {
  const [apps, setApps] = useState<any[]>([]);
  const [now] = useState(new Date());
  const [year] = useState(now.getFullYear());
  const [month] = useState(now.getMonth()); // 0-indexed

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchJSON(`${API_BASE}/applications`);
        setApps(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  // group apps by day (date parsing is naive — expects locale string or ISO)
  const dayMap: Record<string, any[]> = {};
  apps.forEach((a) => {
    if (!a.date) return;
    const d = new Date(a.date);
    if (isNaN(d.getTime())) {
      // try fallback if a.date is dd/mm/yyyy
      const parts = (a.date || "").split("/");
      if (parts.length === 3) {
        const dd = Number(parts[0]), mm = Number(parts[1]) - 1, yy = Number(parts[2]);
        const ddDate = new Date(yy, mm, dd);
        if (!isNaN(ddDate.getTime())) {
          const key = ddDate.getDate();
          (dayMap[key] ||= []).push(a);
          return;
        }
      }
      return;
    }
    if (d.getMonth() === month && d.getFullYear() === year) {
      const key = d.getDate();
      (dayMap[key] ||= []).push(a);
    }
  });

  const totalDays = daysInMonth(year, month);
  const firstDay = new Date(year, month, 1).getDay(); // 0-6

  const weeks: any[] = [];
  let week: any[] = new Array(firstDay).fill(null);
  for (let day = 1; day <= totalDays; day++) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Calendar — {now.toLocaleString(undefined, { month: "long", year: "numeric" })}</h2>

      <div className="bg-white p-4 rounded shadow">
        <div className="grid grid-cols-7 gap-2 text-sm">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-center font-semibold">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2 mt-3">
          {weeks.flat().map((day, idx) => (
            <div key={idx} className="min-h-[80px] border rounded p-2">
              {day ? (
                <>
                  <div className="font-medium">{day}</div>
                  <div className="mt-2 space-y-1">
                    {(dayMap[day] || []).slice(0, 3).map((a: any) => (
                      <div key={a.id} className="text-xs bg-blue-50 text-blue-700 rounded px-1">{a.title}</div>
                    ))}
                    {(dayMap[day] || []).length > 3 && <div className="text-xs text-gray-400">+{(dayMap[day] || []).length - 3} more</div>}
                  </div>
                </>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

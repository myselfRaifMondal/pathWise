// frontend/app/dashboard/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import SmallStatCard from "../../components/SmallStatCard";
import AddApplicationModal from "../../components/AddApplicationModal";
import ApplicationRow from "../../components/ApplicationRow";
import { API_BASE, fetchJSON } from "../../lib/api";

type AppType = { id: number; title: string; company: string; status: string; date?: string };

export default function DashboardWelcome() {
  const [apps, setApps] = useState<AppType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchJSON(`${API_BASE}/applications`);
        // server should send an array
        setApps(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("fetch apps", err);
        setApps([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function handleAdded(newApp: any) {
    // if backend returned created object, push it; else use placeholder
    setApps((s) => [newApp, ...s]);
  }

  function handleDeleted(id: any) {
    setApps((s) => s.filter((x) => x.id !== id));
  }

  function handleUpdated(updated: any) {
    setApps((s) => s.map((a) => (a.id === updated.id ? updated : a)));
  }

  const counts = {
    Applied: apps.filter((a) => a.status === "Applied").length,
    "In Progress": apps.filter((a) => a.status === "In Progress").length,
    Offered: apps.filter((a) => a.status === "Offered").length,
    Rejected: apps.filter((a) => a.status === "Rejected").length,
  };

  const upcoming = apps
    .filter((a) => a.date) // if date exists
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-4 w-full">
          <SmallStatCard title="Applied" value={counts.Applied} color="blue" />
          <SmallStatCard title="In Progress" value={counts["In Progress"]} color="yellow" />
          <SmallStatCard title="Offered" value={counts.Offered} color="green" />
          <SmallStatCard title="Rejected" value={counts.Rejected} color="red" />
        </div>

        <div className="ml-4">
          <AddApplicationModal onAdded={handleAdded} />
        </div>
      </div>

      {/* upcoming deadlines */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-bold mb-2">Today's Deadlines</h3>
          {upcoming.length ? upcoming.map((u) => <div key={u.id} className="text-sm py-1">{u.title} — {u.company}</div>) : <div className="text-sm text-gray-400">No deadlines today</div>}
        </div>

        <div className="bg-white p-4 rounded-lg shadow col-span-2">
          <h3 className="font-bold mb-3">Your Applications</h3>
          {loading ? <div>Loading...</div> : apps.length === 0 ? <div className="text-gray-500">No applications yet.</div> : (
            <table className="w-full border-collapse">
              <thead><tr className="bg-gray-100"><th className="p-2">Title</th><th className="p-2">Company</th><th className="p-2">Status</th><th className="p-2">Date</th><th className="p-2">Actions</th></tr></thead>
              <tbody>
                {apps.map((app) => <ApplicationRow key={app.id} app={app} onDeleted={handleDeleted} onUpdated={handleUpdated} />)}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

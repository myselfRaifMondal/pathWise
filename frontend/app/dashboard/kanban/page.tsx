// frontend/app/dashboard/kanban/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import KanbanColumn from "../../../components/KanbanColumn";
import { API_BASE, fetchJSON } from "../../../lib/api";

export default function KanbanPage() {
  const [apps, setApps] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchJSON(`${API_BASE}/applications`);
        setApps(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setApps([]);
      }
    })();
  }, []);

  function appsByStatus(status: string) {
    return apps.filter((a) => a.status === status);
  }

  async function onDropTo(status: string, idStr: string) {
    const id = Number(idStr);
    try {
      await fetchJSON(`${API_BASE}/applications/${id}`, { method: "PUT", body: JSON.stringify({ status }) });
      setApps((s) => s.map((a) => (a.id === id ? { ...a, status } : a)));
    } catch (err) {
      console.error(err);
      alert("Failed to move card");
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Kanban Board</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KanbanColumn title="Applied" items={appsByStatus("Applied")} onDropApp={(id) => onDropTo("Applied", id)} />
        <KanbanColumn title="In Progress" items={appsByStatus("In Progress")} onDropApp={(id) => onDropTo("In Progress", id)} />
        <KanbanColumn title="Offered" items={appsByStatus("Offered")} onDropApp={(id) => onDropTo("Offered", id)} />
        <KanbanColumn title="Rejected" items={appsByStatus("Rejected")} onDropApp={(id) => onDropTo("Rejected", id)} />
      </div>
    </div>
  );
}

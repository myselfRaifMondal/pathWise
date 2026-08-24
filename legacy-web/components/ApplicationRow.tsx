// frontend/components/ApplicationRow.tsx
"use client";
import React from "react";
import { API_BASE, fetchJSON } from "../lib/api";

export default function ApplicationRow({ app, onUpdated, onDeleted }: { app: any; onUpdated?: (a: any) => void; onDeleted?: (id: any) => void }) {
  async function changeStatus(newStatus: string) {
    try {
      await fetchJSON(`${API_BASE}/applications/${app.id}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      onUpdated?.({ ...app, status: newStatus });
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  }

  async function remove() {
    if (!confirm("Delete this application?")) return;
    try {
      await fetchJSON(`${API_BASE}/applications/${app.id}`, { method: "DELETE" });
      onDeleted?.(app.id);
    } catch (err) {
      console.error(err);
      alert("Failed to delete");
    }
  }

  return (
    <tr className="hover:bg-gray-50">
      <td className="p-2 border">{app.title}</td>
      <td className="p-2 border">{app.company}</td>
      <td className="p-2 border">
        <select value={app.status} onChange={(e) => changeStatus(e.target.value)} className="border rounded px-2 py-1">
          <option>Applied</option>
          <option>In Progress</option>
          <option>Offered</option>
          <option>Rejected</option>
        </select>
      </td>
      <td className="p-2 border">{app.date ?? app.created_at ?? new Date().toLocaleDateString()}</td>
      <td className="p-2 border">
        <button onClick={remove} className="text-sm text-red-600">Delete</button>
      </td>
    </tr>
  );
}

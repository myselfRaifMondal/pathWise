// frontend/components/KanbanColumn.tsx
"use client";
import React, { useState } from "react";
import { API_BASE, fetchJSON } from "../lib/api";

export default function KanbanColumn({ title, items, onDropApp }: { title: string; items: any[]; onDropApp: (itemId: any) => void }) {
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  function allowDrop(e: React.DragEvent) {
    e.preventDefault();
  }
  function drop(e: React.DragEvent) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (id) onDropApp(id);
  }

  async function handleDelete(appId: number) {
    if (!confirm("Delete this application?")) return;
    setLoadingId(appId);
    setError(null);
    try {
      await fetchJSON(`${API_BASE}/applications/${appId}`, { method: "DELETE" });
      window.location.reload(); // quick refresh for now, can be improved
    } catch (err) {
      setError("Failed to delete");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="bg-white rounded-lg p-3 shadow min-h-[200px]">
      <h3 className="font-bold mb-2 text-blue-700">{title}</h3>
      {error && <div className="text-red-600 text-xs mb-2">{error}</div>}
      <div onDragOver={allowDrop} onDrop={drop} className="space-y-2">
        {items.map((it) => (
          <div key={it.id} draggable onDragStart={(e) => e.dataTransfer.setData("text/plain", String(it.id))} className="bg-gray-50 border rounded p-2 flex items-center justify-between cursor-move group">
            <div>
              <div className="font-medium">{it.title}</div>
              <div className="text-xs text-gray-500">{it.company}</div>
            </div>
            <button
              className="text-xs text-red-600 opacity-0 group-hover:opacity-100 ml-2 disabled:opacity-50"
              onClick={() => handleDelete(it.id)}
              disabled={loadingId === it.id}
            >
              {loadingId === it.id ? "..." : "Delete"}
            </button>
          </div>
        ))}
        {items.length === 0 && <div className="text-sm text-gray-400">No items</div>}
      </div>
    </div>
  );
}

// frontend/components/KanbanColumn.tsx
"use client";
import React from "react";

export default function KanbanColumn({ title, items, onDropApp }: { title: string; items: any[]; onDropApp: (itemId: any) => void }) {
  function allowDrop(e: React.DragEvent) {
    e.preventDefault();
  }
  function drop(e: React.DragEvent) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (id) onDropApp(id);
  }

  return (
    <div className="bg-white rounded p-3 shadow min-h-[200px]">
      <h3 className="font-bold mb-2">{title}</h3>
      <div onDragOver={allowDrop} onDrop={drop} className="space-y-2">
        {items.map((it) => (
          <div key={it.id} draggable onDragStart={(e) => e.dataTransfer.setData("text/plain", String(it.id))} className="bg-gray-50 border rounded p-2 cursor-move">
            <div className="font-medium">{it.title}</div>
            <div className="text-xs text-gray-500">{it.company}</div>
          </div>
        ))}
        {items.length === 0 && <div className="text-sm text-gray-400">No items</div>}
      </div>
    </div>
  );
}

// frontend/components/SmallStatCard.tsx
"use client";
import React from "react";

export default function SmallStatCard({ title, value, color = "blue" }: { title: string; value: number | string; color?: string }) {
  const colorClass = {
    blue: "text-blue-600",
    green: "text-green-600",
    yellow: "text-yellow-500",
    red: "text-red-600",
  }[color || "blue"];

  return (
    <div className="bg-white p-4 rounded-lg shadow flex flex-col items-start">
      <div className="text-sm text-gray-500">{title}</div>
      <div className={`text-2xl font-bold ${colorClass}`}>{value}</div>
    </div>
  );
}

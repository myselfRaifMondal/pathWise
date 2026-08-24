// frontend/app/dashboard/settings/page.tsx
"use client";
import React, { useState } from "react";
import { fetchJSON, API_BASE } from "../../../lib/api";

export default function SettingsPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [saving, setSaving] = useState(false);

  async function save(e?: React.FormEvent) {
    e?.preventDefault();
    setSaving(true);
    try {
      // if you have profile endpoints, call them here
      // await fetchJSON(`${API_BASE}/user/profile`, { method: "PUT", body: JSON.stringify({ username, email }) });
      alert("Saved (demo)");
    } catch (err) {
      console.error(err);
      alert("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Settings</h2>

      <form onSubmit={save} className="bg-white p-6 rounded shadow space-y-4">
        <div>
          <label className="block text-sm text-gray-600">Username</label>
          <input className="w-full border rounded px-3 py-2" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Your display name" />
        </div>

        <div>
          <label className="block text-sm text-gray-600">Email</label>
          <input className="w-full border rounded px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>

        <div>
          <label className="block text-sm text-gray-600">Theme</label>
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={() => setTheme("light")} className={`px-3 py-2 rounded border ${theme === "light" ? "bg-blue-600 text-white" : ""}`}>Light</button>
            <button type="button" onClick={() => setTheme("dark")} className={`px-3 py-2 rounded border ${theme === "dark" ? "bg-blue-600 text-white" : ""}`}>Dark</button>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded">{saving ? "Saving..." : "Save changes"}</button>
        </div>
      </form>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold">Danger Zone</h3>
        <p className="text-sm text-gray-500 mt-2">Logout from this device</p>
        <form action="/logout" method="post">
          <button className="mt-2 px-3 py-2 bg-red-600 text-white rounded">Logout</button>
        </form>
      </div>
    </div>
  );
}

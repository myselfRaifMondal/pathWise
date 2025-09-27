// frontend/components/AddApplicationModal.tsx
"use client";
import React, { useState } from "react";
import { fetchJSON, API_BASE } from "../lib/api";

type Props = { onAdded?: (app: any) => void; defaultOpen?: boolean };

export default function AddApplicationModal({ onAdded, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState("Applied");
  const [loading, setLoading] = useState(false);

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    try {
      const payload = { title, company, status };
      // POST to backend
      const result = await fetchJSON(`${API_BASE}/applications`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      // backend might return created object or just message
      if (onAdded) onAdded(result || { title, company, status, id: Date.now(), date: new Date().toLocaleDateString() });
      setTitle("");
      setCompany("");
      setStatus("Applied");
      setOpen(false);
    } catch (err) {
      console.error("Add app error", err);
      alert("Failed to add application. Check console.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
        + Add Application
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-lg">
            <h3 className="text-lg font-bold mb-4">Add Application</h3>
            <form onSubmit={(e) => submit(e)}>
              <div className="space-y-3">
                <input className="w-full border rounded px-3 py-2" placeholder="Job / Internship title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                <input className="w-full border rounded px-3 py-2" placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} required />
                <select className="w-full border rounded px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option>Applied</option>
                  <option>In Progress</option>
                  <option>Offered</option>
                  <option>Rejected</option>
                </select>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setOpen(false)} className="px-3 py-2 rounded border">Cancel</button>
                <button type="submit" disabled={loading} className="px-3 py-2 rounded bg-blue-600 text-white">
                  {loading ? "Saving..." : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

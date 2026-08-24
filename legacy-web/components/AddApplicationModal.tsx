// frontend/components/AddApplicationModal.tsx
"use client";
import React, { useState } from "react";
import { fetchJSON, API_BASE } from "../lib/api";
import { Button, Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, Input } from "../lib/ui";

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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">+ Add Application</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Application</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <Input placeholder="Job / Internship title" value={title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)} required />
          <Input placeholder="Company" value={company} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompany(e.target.value)} required />
          <select className="w-full border rounded px-3 py-2" value={status} onChange={e => setStatus(e.target.value)}>
            <option>Applied</option>
            <option>In Progress</option>
            <option>Offered</option>
            <option>Rejected</option>
          </select>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Add"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

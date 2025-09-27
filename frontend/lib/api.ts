// frontend/lib/api.ts
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function fetchJSON(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`API error ${res.status}: ${txt}`);
  }
  try {
    return await res.json();
  } catch {
    return null;
  }
}

import type { Stage } from '@/theme/tokens';

export type Contact = {
  name: string | null;
  title: string | null;
  email: string | null;
};

/** Exactly the object `GET /api/applications` returns. */
export type Application = {
  id: number;
  role: string;
  company: string;
  stage: Stage;
  /** ISO `YYYY-MM-DD`, or null for a saved-but-not-submitted application */
  applied: string | null;
  deadline: string | null;
  /** What the deadline is for: "Onsite loop", "Take-home due", … */
  kind: string | null;
  location: string | null;
  note: string | null;
  contact: Contact | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type ApplicationInput = {
  role: string;
  company: string;
  stage: Stage;
  applied?: string | null;
  deadline?: string | null;
  kind?: string | null;
  location?: string | null;
  note?: string | null;
  contact?: Contact | null;
};

export type User = {
  id: number;
  email: string;
  name: string | null;
  themePreference: 'dark' | 'light';
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

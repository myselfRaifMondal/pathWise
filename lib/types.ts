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

export const SENIORITIES = ['Intern', 'Entry', 'Junior', 'Mid', 'Senior', 'Lead'] as const;
export type Seniority = (typeof SENIORITIES)[number];

export const WORK_TYPES = ['Remote', 'Hybrid', 'Onsite', 'Any'] as const;
export type WorkType = (typeof WORK_TYPES)[number];

/**
 * The details a job application or portal asks for, kept once and reused.
 * Exactly the shape GET /api/profile returns — every field nullable, because
 * the endpoint answers with an empty profile rather than 404ing.
 */
export type Profile = {
  fullName: string | null;
  phone: string | null;
  currentLocation: string | null;
  resumeUrl: string | null;
  noticePeriod: string | null;
  workAuthorization: string | null;
  targetRoles: string[];
  seniority: Seniority | null;
  preferredLocations: string[];
  workType: WorkType | null;
  skills: string[];
  yearsExperience: number | null;
  education: string | null;
  expectedSalaryMin: number | null;
  salaryCurrency: string;
  portfolioUrl: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  updatedAt: string | null;
};

export type ProfileInput = Partial<Omit<Profile, 'updatedAt'>>;

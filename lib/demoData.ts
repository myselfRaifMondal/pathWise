/**
 * The sample applications from `PathWise Minimal App.dc.html`, kept for the
 * landing page's "View the demo" entry point.
 *
 * The design pinned every date against a fixed TODAY of 2026-08-24. Here the
 * dates are offsets in days from the real today, so the demo never goes stale.
 */
import { toISODate } from '@/lib/format';
import type { Application } from '@/lib/types';

type Seed = Omit<Application, 'applied' | 'deadline' | 'createdAt' | 'updatedAt'> & {
  appliedOffset: number | null;
  deadlineOffset: number | null;
};

const SEEDS: Seed[] = [
  { id: 1, role: 'SWE Intern', company: 'Stripe', stage: 'Interview', appliedOffset: -21, deadlineOffset: 2, kind: 'Onsite loop', location: 'Bengaluru', note: 'Phone screen done. Onsite is systems + data structures; prep the payments case study.', contact: { name: 'Priya Raman', title: 'University recruiter', email: 'priya.raman@example.com' } },
  { id: 2, role: 'Frontend Engineer', company: 'Vercel', stage: 'Screening', appliedOffset: -14, deadlineOffset: 4, kind: 'Recruiter call', location: 'Remote', note: 'They asked for a portfolio link — sent the tracker rebuild.', contact: { name: 'Dana Wells', title: 'Talent partner', email: 'dana@example.com' } },
  { id: 3, role: 'Data Analyst', company: 'Zerodha', stage: 'Applied', appliedOffset: -9, deadlineOffset: null, kind: null, location: 'Bengaluru', note: null, contact: null },
  { id: 4, role: 'ML Intern', company: 'Sarvam AI', stage: 'Interview', appliedOffset: -27, deadlineOffset: 1, kind: 'Technical round', location: 'Bengaluru', note: 'Round 2 covers transformer internals and the take-home follow-up.', contact: { name: 'Arjun Nair', title: 'Engineering lead', email: 'arjun@example.com' } },
  { id: 5, role: 'Backend Engineer', company: 'Razorpay', stage: 'Offer', appliedOffset: -43, deadlineOffset: 6, kind: 'Offer expiry', location: 'Bengaluru', note: 'Offer expires soon. 18 LPA base + 2 L joining. Ask about the payments-infra team before accepting.', contact: { name: 'Sneha Kulkarni', title: 'HR business partner', email: 'sneha.k@example.com' } },
  { id: 6, role: 'Product Analyst', company: 'Flipkart', stage: 'Rejected', appliedOffset: -35, deadlineOffset: null, kind: null, location: 'Bengaluru', note: 'Rejected after case round. Feedback: sharpen the sizing estimates.', contact: null },
  { id: 7, role: 'QA Engineer', company: 'Atlassian', stage: 'Applied', appliedOffset: -6, deadlineOffset: 9, kind: 'Assessment due', location: 'Remote', note: null, contact: null },
  { id: 8, role: 'Research Intern', company: 'D. E. Shaw', stage: 'Saved', appliedOffset: null, deadlineOffset: 15, kind: 'Application closes', location: 'Hyderabad', note: 'Needs a one-page research statement. Draft started.', contact: null },
  { id: 9, role: 'Site Reliability Engineer', company: 'Cloudflare', stage: 'Applied', appliedOffset: -4, deadlineOffset: null, kind: null, location: 'Remote', note: null, contact: null },
  { id: 10, role: 'Design Engineer', company: 'Linear', stage: 'Screening', appliedOffset: -16, deadlineOffset: 3, kind: 'Take-home due', location: 'Remote', note: 'Take-home: rebuild an issue board. Timebox to six hours.', contact: { name: 'Mia Chen', title: 'Recruiting', email: 'mia@example.com' } },
  { id: 11, role: 'Growth Analyst', company: 'Notion', stage: 'Saved', appliedOffset: null, deadlineOffset: 12, kind: 'Application closes', location: 'Remote', note: null, contact: null },
  { id: 12, role: 'iOS Engineer', company: 'Spotify', stage: 'Rejected', appliedOffset: -25, deadlineOffset: null, kind: null, location: 'Remote', note: null, contact: null },
];

function shift(days: number | null): string | null {
  if (days === null) return null;
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

export function demoApplications(): Application[] {
  const stamp = new Date().toISOString();
  return SEEDS.map(({ appliedOffset, deadlineOffset, ...rest }) => ({
    ...rest,
    applied: shift(appliedOffset),
    deadline: shift(deadlineOffset),
    createdAt: stamp,
    updatedAt: stamp,
  }));
}

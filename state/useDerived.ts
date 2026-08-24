/**
 * Port of `renderVals()` from `PathWise Minimal App.dc.html`.
 *
 * Everything the screens display is derived here, so the app and the design
 * agree on one definition of "in pipeline", "response rate", which deadlines
 * count as upcoming, and how the calendar grid is laid out.
 */
import { useMemo } from 'react';

import { daysTo, fmt, fmtLong, initials, toISODate, today } from '@/lib/format';
import type { Application } from '@/lib/types';
import { STAGES, badgeToneFor, type Stage, type Theme } from '@/theme/tokens';

/** How far ahead the Overview deadline list looks. */
const DEADLINE_WINDOW_DAYS = 14;
/** A deadline this close is shown in red. */
const URGENT_DAYS = 2;

export type DecoratedApplication = Application & {
  badgeBg: string;
  badgeColor: string;
  deadlineLabel: string;
  deadlineShort: string | null;
  appliedLong: string;
  deadlineLong: string;
  /** Red when overdue or nearly due, muted when there is no deadline at all. */
  deadlineColor: string;
  daysToDeadline: number | null;
  contactInitials: string;
};

export type Metric = { label: string; value: string; unit: string };
export type UpcomingDeadline = {
  id: number;
  role: string;
  company: string;
  kind: string;
  timeLabel: string;
  timeColor: string;
};
export type BoardColumn = { stage: Stage; count: number; items: DecoratedApplication[] };
export type CalendarCell = {
  key: string;
  day: number;
  isToday: boolean;
  events: { id: number; label: string }[];
};
export type FunnelRow = { stage: Stage; count: number; widthPct: number };

export type Derived = {
  applications: DecoratedApplication[];
  hasApplications: boolean;
  metrics: Metric[];
  deadlines: UpcomingDeadline[];
  columns: BoardColumn[];
  funnel: FunnelRow[];
  rates: { response: string; interview: string; offer: string };
  offers: number;
  rejected: number;
};

function decorate(application: Application, theme: Theme, now: Date): DecoratedApplication {
  const badge = theme.badge[badgeToneFor(application.stage)];
  const distance = daysTo(application.deadline, now);
  const overdue = distance !== null && distance < 0;
  const soon = distance !== null && distance >= 0 && distance <= URGENT_DAYS;

  return {
    ...application,
    badgeBg: badge.bg,
    badgeColor: badge.fg,
    deadlineLabel: application.deadline ? fmt(application.deadline) : '—',
    deadlineShort: application.deadline ? fmt(application.deadline) : null,
    appliedLong: fmtLong(application.applied),
    deadlineLong: fmtLong(application.deadline),
    deadlineColor:
      overdue || soon
        ? theme.colors.red
        : application.deadline
          ? theme.colors.fg
          : theme.colors.fg2,
    daysToDeadline: distance,
    contactInitials: application.contact?.name ? initials(application.contact.name) : '',
  };
}

export function useDerived(applications: Application[], theme: Theme): Derived {
  return useMemo(() => {
    const now = today();

    const decorated = applications
      .slice()
      // Oldest application first, with undated (Saved) rows last. The design
      // gets this by substituting '9999' for a missing date and comparing the
      // ISO strings directly.
      .sort((a, b) => ((b.applied ?? '9999') > (a.applied ?? '9999') ? -1 : 1))
      .map((application) => decorate(application, theme, now));

    const countOf = (stage: Stage) => applications.filter((row) => row.stage === stage).length;

    const columns: BoardColumn[] = STAGES.map((stage) => {
      const items = decorated.filter((row) => row.stage === stage);
      return { stage, count: items.length, items };
    });

    const withDeadline = decorated.filter(
      (row): row is DecoratedApplication & { daysToDeadline: number } =>
        row.daysToDeadline !== null,
    );

    const deadlines: UpcomingDeadline[] = withDeadline
      .filter((row) => row.daysToDeadline >= 0 && row.daysToDeadline <= DEADLINE_WINDOW_DAYS)
      .sort((a, b) => a.daysToDeadline - b.daysToDeadline)
      .map((row) => ({
        id: row.id,
        role: row.role,
        company: row.company,
        kind: row.kind || 'Deadline',
        timeLabel: row.daysToDeadline === 0 ? 'Today' : `in ${row.daysToDeadline}d`,
        timeColor: row.daysToDeadline <= 1 ? theme.colors.red : theme.colors.fg2,
      }));

    // "Submitted" excludes Saved: you cannot get a response to something you
    // have not sent. Every rate below is a share of submitted.
    const submitted = applications.filter((row) => row.stage !== 'Saved').length;
    const responded =
      countOf('Screening') + countOf('Interview') + countOf('Offer') + countOf('Rejected');
    const reachedInterview = countOf('Interview') + countOf('Offer');
    const pct = (numerator: number, denominator: number) =>
      denominator === 0 ? '—' : `${Math.round((100 * numerator) / denominator)}%`;

    const nextDeadline = withDeadline
      .filter((row) => row.daysToDeadline >= 0)
      .sort((a, b) => a.daysToDeadline - b.daysToDeadline)[0];

    const metrics: Metric[] = [
      { label: 'Tracked', value: String(applications.length), unit: '' },
      {
        label: 'In pipeline',
        value: String(applications.length - countOf('Rejected') - countOf('Saved')),
        unit: '',
      },
      { label: 'Interviews', value: String(countOf('Interview')), unit: '' },
      {
        label: 'Response rate',
        value: pct(responded, submitted),
        unit: submitted ? `${responded} of ${submitted}` : '',
      },
      {
        label: 'Next deadline',
        value: nextDeadline
          ? nextDeadline.daysToDeadline === 0
            ? 'Today'
            : `${nextDeadline.daysToDeadline}d`
          : '—',
        unit: nextDeadline ? nextDeadline.company : '',
      },
    ];

    const busiestStage = Math.max(1, ...STAGES.map(countOf));
    const funnel: FunnelRow[] = STAGES.map((stage) => ({
      stage,
      count: countOf(stage),
      widthPct: Math.round((100 * countOf(stage)) / busiestStage),
    }));

    return {
      applications: decorated,
      hasApplications: decorated.length > 0,
      metrics,
      deadlines,
      columns,
      funnel,
      rates: {
        response: pct(responded, submitted),
        interview: pct(reachedInterview, submitted),
        offer: pct(countOf('Offer'), submitted),
      },
      offers: countOf('Offer'),
      rejected: countOf('Rejected'),
    };
  }, [applications, theme]);
}

/**
 * Month grid for the calendar. The design hardcoded August 2026; this takes the
 * month as an argument so the screen can page backwards and forwards.
 */
export function buildCalendar(
  month: Date,
  applications: DecoratedApplication[],
): { cells: CalendarCell[]; deadlineCount: number } {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const leadingBlanks = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const todayISO = toISODate(today());

  const cells: CalendarCell[] = [];
  for (let i = 0; i < leadingBlanks; i += 1) {
    cells.push({ key: `lead-${i}`, day: 0, isToday: false, events: [] });
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    const iso = toISODate(new Date(year, monthIndex, day));
    cells.push({
      key: iso,
      day,
      isToday: iso === todayISO,
      events: applications
        .filter((row) => row.deadline === iso)
        .map((row) => ({ id: row.id, label: `${row.company} · ${row.kind || 'Deadline'}` })),
    });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ key: `trail-${cells.length}`, day: 0, isToday: false, events: [] });
  }

  const prefix = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
  const deadlineCount = applications.filter((row) => row.deadline?.startsWith(prefix)).length;

  return { cells, deadlineCount };
}

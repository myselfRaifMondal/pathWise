import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { api } from '@/lib/api';
import { demoApplications } from '@/lib/demoData';
import { plain } from '@/lib/storage';
import type { Application, ApplicationInput } from '@/lib/types';
import type { Stage } from '@/theme/tokens';

import { useAuth } from '@/state/AuthProvider';

const DEMO_KEY = 'pathwise.demo';

type ApplicationsContextValue = {
  applications: Application[];
  loading: boolean;
  error: string | null;
  /** True when showing the landing page's sample data instead of a real account. */
  demo: boolean;
  startDemo: () => void;
  endDemo: () => void;
  reload: () => Promise<void>;
  create: (input: ApplicationInput) => Promise<Application>;
  update: (id: number, patch: Partial<ApplicationInput>) => Promise<void>;
  moveToStage: (id: number, stage: Stage) => Promise<void>;
  remove: (id: number) => Promise<void>;
};

const ApplicationsContext = createContext<ApplicationsContextValue | null>(null);

export function ApplicationsProvider({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demo, setDemo] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setApplications(await api.listApplications());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not load applications');
    } finally {
      setLoading(false);
    }
  }, []);

  // Survive a web reload while in demo mode, so refreshing does not bounce
  // the visitor back to an empty state.
  useEffect(() => {
    plain.get(DEMO_KEY).then((stored) => {
      if (stored === '1') {
        setDemo(true);
        setApplications(demoApplications());
      }
    });
  }, []);

  useEffect(() => {
    if (demo) return;
    if (status === 'authenticated') void reload();
    if (status === 'anonymous') setApplications([]);
  }, [demo, reload, status]);

  const startDemo = useCallback(() => {
    setDemo(true);
    setApplications(demoApplications());
    void plain.set(DEMO_KEY, '1');
  }, []);

  const endDemo = useCallback(() => {
    setDemo(false);
    setApplications([]);
    void plain.remove(DEMO_KEY);
  }, []);

  // A signed-in account always wins over the demo.
  useEffect(() => {
    if (status === 'authenticated' && demo) endDemo();
  }, [demo, endDemo, status]);

  const value = useMemo<ApplicationsContextValue>(() => {
    const nextDemoId = () => Math.max(0, ...applications.map((row) => row.id)) + 1;

    return {
      applications,
      loading,
      error,
      demo,
      startDemo,
      endDemo,
      reload,

      create: async (input) => {
        if (demo) {
          const created: Application = {
            id: nextDemoId(),
            role: input.role,
            company: input.company,
            stage: input.stage,
            applied: input.applied ?? null,
            deadline: input.deadline ?? null,
            kind: input.kind ?? null,
            location: input.location ?? null,
            note: input.note ?? null,
            contact: input.contact ?? null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setApplications((current) => [created, ...current]);
          return created;
        }
        const created = await api.createApplication(input);
        setApplications((current) => [created, ...current]);
        return created;
      },

      update: async (id, patch) => {
        if (demo) {
          setApplications((current) =>
            current.map((row) => (row.id === id ? { ...row, ...patch } : row)),
          );
          return;
        }
        const updated = await api.updateApplication(id, patch);
        setApplications((current) => current.map((row) => (row.id === id ? updated : row)));
      },

      moveToStage: async (id, stage) => {
        // Optimistic: dragging a card must not wait on the network.
        const previous = applications;
        setApplications((current) =>
          current.map((row) => (row.id === id ? { ...row, stage } : row)),
        );
        if (demo) return;
        try {
          const updated = await api.updateApplication(id, { stage });
          setApplications((current) => current.map((row) => (row.id === id ? updated : row)));
        } catch (caught) {
          setApplications(previous);
          throw caught;
        }
      },

      remove: async (id) => {
        if (!demo) await api.deleteApplication(id);
        setApplications((current) => current.filter((row) => row.id !== id));
      },
    };
  }, [applications, demo, endDemo, error, loading, reload, startDemo]);

  return <ApplicationsContext.Provider value={value}>{children}</ApplicationsContext.Provider>;
}

export function useApplications() {
  const context = useContext(ApplicationsContext);
  if (!context) throw new Error('useApplications must be used inside ApplicationsProvider');
  return context;
}

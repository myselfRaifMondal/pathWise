import { secure } from '@/lib/storage';
import type { Application, ApplicationInput, AuthResponse, User } from '@/lib/types';

export const API_BASE = (
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5001'
).replace(/\/$/, '');

const ACCESS_KEY = 'pathwise.accessToken';
const REFRESH_KEY = 'pathwise.refreshToken';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const tokens = {
  read: async () => ({
    access: await secure.get(ACCESS_KEY),
    refresh: await secure.get(REFRESH_KEY),
  }),
  write: async (access: string, refresh?: string) => {
    await secure.set(ACCESS_KEY, access);
    if (refresh) await secure.set(REFRESH_KEY, refresh);
  },
  clear: async () => {
    await secure.remove(ACCESS_KEY);
    await secure.remove(REFRESH_KEY);
  },
};

async function parse(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/** Exchanges the refresh token for a new access token. Null if that fails. */
async function refreshAccessToken(): Promise<string | null> {
  const { refresh } = await tokens.read();
  if (!refresh) return null;

  const response = await fetch(`${API_BASE}/api/auth/refresh`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${refresh}` },
  });
  if (!response.ok) {
    await tokens.clear();
    return null;
  }
  const body = await parse(response);
  const access = body?.accessToken ?? null;
  if (access) await tokens.write(access);
  return access;
}

type RequestOptions = { method?: string; body?: unknown; auth?: boolean };

/**
 * One request. When an authenticated call comes back 401, the access token is
 * refreshed once and the call retried; a second 401 means the session is gone.
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = options;

  const send = async (accessToken: string | null) => {
    const headers: Record<string, string> = {};
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
    return fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  };

  let access = auth ? (await tokens.read()).access : null;
  let response = await send(access);

  if (response.status === 401 && auth) {
    access = await refreshAccessToken();
    if (access) response = await send(access);
  }

  const payload = await parse(response);
  if (!response.ok) {
    const message =
      (payload && typeof payload === 'object' && 'error' in payload
        ? String((payload as { error: unknown }).error)
        : null) ?? `Request failed (${response.status})`;
    throw new ApiError(response.status, message);
  }
  return payload as T;
}

export const api = {
  health: () => request<{ status: string }>('/api/health', { auth: false }),

  signup: (email: string, password: string, name?: string) =>
    request<AuthResponse>('/api/auth/signup', {
      method: 'POST',
      body: { email, password, name },
      auth: false,
    }),

  login: (email: string, password: string) =>
    request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
      auth: false,
    }),

  forgot: (email: string) =>
    request<{ message: string }>('/api/auth/forgot', {
      method: 'POST',
      body: { email },
      auth: false,
    }),

  resetPassword: (token: string, password: string) =>
    request<AuthResponse>('/api/auth/reset', {
      method: 'POST',
      body: { token, password },
      auth: false,
    }),

  me: () => request<User>('/api/auth/me'),

  updateMe: (patch: Partial<Pick<User, 'name' | 'themePreference'>>) =>
    request<User>('/api/auth/me', { method: 'PATCH', body: patch }),

  deleteAccount: () => request<{ message: string }>('/api/auth/account', { method: 'DELETE' }),

  listApplications: () => request<Application[]>('/api/applications'),

  createApplication: (input: ApplicationInput) =>
    request<Application>('/api/applications', { method: 'POST', body: input }),

  updateApplication: (id: number, patch: Partial<ApplicationInput>) =>
    request<Application>(`/api/applications/${id}`, { method: 'PATCH', body: patch }),

  deleteApplication: (id: number) =>
    request<{ message: string }>(`/api/applications/${id}`, { method: 'DELETE' }),
};

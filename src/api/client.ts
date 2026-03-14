/**
 * Pincer API client
 * Base URL and API key are stored in AsyncStorage and loaded at runtime.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEY_BASE_URL = 'pincerBaseUrl';
export const STORAGE_KEY_API_KEY = 'pincerApiKey';
export const STORAGE_KEY_HUMAN_AGENT_ID = 'pincerHumanAgentId';

export interface ApiConfig {
  baseUrl: string;
  apiKey: string;
}

let _config: ApiConfig | null = null;

export async function loadConfig(): Promise<ApiConfig | null> {
  const [baseUrl, apiKey] = await Promise.all([
    AsyncStorage.getItem(STORAGE_KEY_BASE_URL),
    AsyncStorage.getItem(STORAGE_KEY_API_KEY),
  ]);
  if (!baseUrl || !apiKey) return null;
  _config = { baseUrl: baseUrl.replace(/\/$/, ''), apiKey };
  return _config;
}

export function getConfig(): ApiConfig | null {
  return _config;
}

export async function saveConfig(config: ApiConfig): Promise<void> {
  await Promise.all([
    AsyncStorage.setItem(STORAGE_KEY_BASE_URL, config.baseUrl),
    AsyncStorage.setItem(STORAGE_KEY_API_KEY, config.apiKey),
  ]);
  _config = config;
}

export async function clearConfig(): Promise<void> {
  await Promise.all([
    AsyncStorage.removeItem(STORAGE_KEY_BASE_URL),
    AsyncStorage.removeItem(STORAGE_KEY_API_KEY),
    AsyncStorage.removeItem(STORAGE_KEY_HUMAN_AGENT_ID),
  ]);
  _config = null;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  config?: ApiConfig,
): Promise<T> {
  const cfg = config ?? _config;
  if (!cfg) throw new ApiError(0, 'Not configured');

  const url = `${cfg.baseUrl}/api/v1${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': cfg.apiKey,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new ApiError(res.status, text || `HTTP ${res.status}`);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string, config?: ApiConfig) =>
    request<T>(path, { method: 'GET' }, config),

  post: <T>(path: string, body?: unknown, config?: ApiConfig) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }, config),

  patch: <T>(path: string, body?: unknown, config?: ApiConfig) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }, config),

  delete: <T>(path: string, config?: ApiConfig) =>
    request<T>(path, { method: 'DELETE' }, config),
};

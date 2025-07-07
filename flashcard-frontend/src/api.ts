const API_URL = '/api';

export async function apiRequest(path: string, options: RequestInit = {}, token?: string) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const text = await res.text();

  if (!res.ok) {
    let error;
    try {
      error = JSON.parse(text);
    } catch {
      error = { message: text || res.statusText };
    }
    throw new Error(error.message || res.statusText);
  }

  if (text) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }
  return null;
} 
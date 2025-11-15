const API_URL = '/api';

export async function apiRequest(path: string, options: RequestInit = {}, token?: string) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const text = await res.text();

  // Handle error responses
  if (!res.ok) {
    let message = res.statusText;
    if (text.length > 0) {
      try {
        const data = JSON.parse(text);
        message = data.message || JSON.stringify(data);
      } catch {
        message = text;
      }
    }
    throw new Error(message);
  }

  // Safely parse JSON if body is not empty
  if (text.length > 0) {
    try {
      return JSON.parse(text);
    } catch {
      return text; // fallback to raw text
    }
  }

  return null; // empty response
}

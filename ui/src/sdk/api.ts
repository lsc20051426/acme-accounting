export const API_BASE_URL =
  typeof process !== 'undefined' ? process.env.API_BASE_URL : undefined;

export function apiFetch(path: string, options?: RequestInit) {
  const url = API_BASE_URL ? new URL(path, API_BASE_URL).toString() : path;
  return fetch(url, options);
}

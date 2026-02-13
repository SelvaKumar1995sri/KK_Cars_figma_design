import { API } from "./apiConfig";

const ACCESS_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';

export function setTokens(access: string, refresh?: string) {
  localStorage.setItem(ACCESS_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export async function register(email: string, password: string, name?: string) {
  const res = await fetch(`${API}/auth/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  return res.json();
}

export async function login(email: string, password: string) {
  // TokenObtainPairView expects 'username' and 'password' by default
  const res = await fetch(`${API}/auth/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: email, password }),
  });
  return res.json();
}

export async function getCurrentUser() {
  const token = getAccessToken();
  if (!token) return null;
  const res = await fetch(`${API}/auth/me/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function authFetch(input: RequestInfo, init: RequestInit = {}) {
  const token = getAccessToken();
  init.headers = init.headers || {};
  // @ts-ignore
  init.headers = { ...(init.headers as any), Authorization: token ? `Bearer ${token}` : undefined };
  return fetch(input, init);
}

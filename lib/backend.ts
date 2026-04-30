import axios from "axios";
import { cookies } from "next/headers";

// Server-only — never import this file in client components or lib/axios.ts
export const backend = axios.create({
  baseURL: process.env.BACKEND_URL,
  headers: { "Content-Type": "application/json" },
});

export const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export const ACCESS_MAX_AGE = 60 * 15;           // 15 minutes
export const REFRESH_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function getAccessToken(): Promise<string | null> {
  const store = await cookies();
  return store.get("access_token")?.value ?? null;
}

export function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "X-API-Version": "1",
  };
}

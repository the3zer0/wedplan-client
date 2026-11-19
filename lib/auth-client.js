"use client";

import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
  fetchOptions: {
    credentials: "include",
  },
  plugins: [jwtClient()],
});

export async function getAuthToken() {
  if (typeof window === "undefined") return null;

  const result = await authClient.token();
  if (result.error?.status === 401) return null;
  if (result.error) {
    throw new Error(result.error.message || "Unable to fetch an API token.");
  }

  return result.data?.token || null;
}

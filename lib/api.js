import { authClient, getAuthToken } from "@/lib/auth-client";

export async function apiFetch(path, options = {}) {
  const token = await getAuthToken();
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api${path}`, { ...options, credentials: "include", headers: { ...(isFormData ? {} : { "Content-Type": "application/json" }), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } });
  if (response.status === 401) { await authClient.signOut(); throw new Error("Your session has expired. Please sign in again."); }
  if (!response.ok) {
    const body = await response.text();
    let message = body;
    try { message = JSON.parse(body)?.message || JSON.parse(body)?.error || body; } catch {}
    if (response.status === 403 && message === "This account is blocked") {
      await authClient.signOut();
      if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("wedplan:blocked-account"));
      if (typeof window !== "undefined") window.location.replace("/signin?blocked=1");
      const blockedError = new Error(message);
      blockedError.status = 403;
      throw blockedError;
    }
    const error = new Error(message || (response.status === 403 ? "You do not have permission to access this resource." : `Request failed with status ${response.status}`));
    error.status = response.status;
    throw error;
  }
  return response.status === 204 ? null : response.json();
}

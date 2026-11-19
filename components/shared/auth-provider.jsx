"use client";

import { createContext, useContext, useMemo } from "react";
import { authClient, getAuthToken } from "@/lib/auth-client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const session = authClient.useSession();
  const user = session.data?.user || null;

  const value = useMemo(() => ({
    user,
    role: user?.role || null,
    isPending: session.isPending,
    signIn: (credentials) => authClient.signIn.email(credentials),
    signInWithGoogle: (options) => authClient.signIn.social({ provider: "google", ...options }),
    signUp: (credentials) => authClient.signUp.email(credentials),
    signOut: () => authClient.signOut(),
    refreshUser: session.refetch,
    getJwt: getAuthToken,
  }), [session.isPending, session.refetch, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider.");
  return context;
}

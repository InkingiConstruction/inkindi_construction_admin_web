import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_APP_BASE_URL,
  basePath: "/api/v1/auth",
});

export const { signIn, signUp, signOut, useSession } = authClient;

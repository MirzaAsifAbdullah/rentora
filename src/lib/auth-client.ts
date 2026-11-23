import {
  inferAdditionalFields,
  inferOrgAdditionalFields,
  organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react"
import { auth } from "./auth";
export const authClient = createAuthClient({
  /** Use the current origin in the browser (works on any port/domain). */
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.BETTER_AUTH_URL || "http://localhost:3000",
  plugins: [
    inferAdditionalFields<typeof auth>(),
    organizationClient({
      schema: inferOrgAdditionalFields<typeof auth>(),
    }),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;

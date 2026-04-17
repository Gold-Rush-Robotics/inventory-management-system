import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { env } from "@/env";
import { db } from "@/server/db";

const baseURL = env.BETTER_AUTH_URL ?? "http://localhost:3000";

const discordProvider = {
  discord: {
    clientId: env.BETTER_AUTH_DISCORD_CLIENT_ID,
    clientSecret: env.BETTER_AUTH_DISCORD_CLIENT_SECRET,
    redirectURI: `${baseURL}/api/auth/callback/discord`,
  },
};

export const auth = betterAuth({
  baseURL,
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: discordProvider,
});

export type Session = typeof auth.$Infer.Session;

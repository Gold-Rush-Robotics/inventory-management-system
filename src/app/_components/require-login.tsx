"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/server/better-auth/client";
import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

export interface RequireLoginProps {
  children: React.ReactNode;
}

export interface RequireLoginContextValue {
  signOut: () => Promise<void>;
}

const RequireLoginContext = createContext<RequireLoginContextValue | null>(
  null,
);

export function useRequireLogin() {
  const context = useContext(RequireLoginContext);

  if (!context) {
    throw new Error("useRequireLogin must be used within RequireLogin");
  }

  return context;
}

export default function RequireLogin({ children }: RequireLoginProps) {
  const [error, setError] = useState<Error | null>(null);
  const {
    data: session,
    error: sessionError,
    isPending,
  } = authClient.useSession();
  const pathname = usePathname();
  const router = useRouter();

  // Sign in if not authenticated
  useEffect(() => {
    if (sessionError) {
      setError(sessionError);
      return;
    }

    if (isPending || session) {
      return;
    }

    void authClient.signIn
      .social({
        provider: "discord",
        callbackURL: pathname,
      })
      .catch((error) => {
        setError(error as Error);
      });
  }, [isPending, pathname, session, sessionError]);

  async function signOut() {
    await authClient.signOut();
    router.refresh();
  }

  if (error) {
    return (
      <div className="flex h-dvh w-dvw">
        <Card className="m-auto w-[80%] max-w-2xl min-w-60 p-4">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              We tried to sign you in with Discord, but something went wrong.
              Refresh the page to try again.
              <br />
              Error: {error instanceof Error ? error.message : "Unknown error"}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isPending || !session) {
    return (
      <div className="flex h-dvh w-dvw items-center justify-center">
        <Card className="flex flex-row items-center gap-2 p-4">
          Signing you in... <Loader2 className="size-4 animate-spin" />
        </Card>
      </div>
    );
  }

  return (
    <RequireLoginContext.Provider value={{ signOut }}>
      {children}
    </RequireLoginContext.Provider>
  );
}

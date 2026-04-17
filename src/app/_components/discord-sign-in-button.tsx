"use client";

import { useState } from "react";

import { authClient } from "@/server/better-auth/client";

export function DiscordSignInButton() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    try {
      setIsPending(true);
      setError(null);

      await authClient.signIn.social({
        provider: "discord",
        callbackURL: "/",
      });
    } catch {
      setIsPending(false);
      setError("Unable to start Discord sign in. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isPending}
        onClick={() => void handleSignIn()}
        type="button"
      >
        {isPending ? "Redirecting..." : "Sign in with Discord"}
      </button>
      {error ? <p className="text-center text-sm text-red-300">{error}</p> : null}
    </div>
  );
}

"use client";

/**
 * Header sign-in control. Signed out: "Sign in" with the GitHub mark. Signed in:
 * the GitHub avatar + a sign-out action. Reads identity client-side (name/avatar
 * from user_metadata; no profiles table), so pages stay statically rendered.
 *
 * No-ops gracefully if the auth env isn't configured.
 */
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getBrowserClient } from "@/lib/supabase/client";
import { GithubIcon } from "@/components/ui";

export function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let supabase;
    try {
      supabase = getBrowserClient();
    } catch {
      setReady(true);
      return;
    }
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = () => {
    const supabase = getBrowserClient();
    const next = window.location.pathname + window.location.search;
    void supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  };

  const signOut = () => {
    void getBrowserClient().auth.signOut();
  };

  // Avoid a flash of the wrong state before we know who's signed in.
  if (!ready) return <div className="h-7 w-7" aria-hidden />;

  if (user) {
    const avatar = user.user_metadata?.avatar_url as string | undefined;
    const handle =
      (user.user_metadata?.user_name as string | undefined) ??
      (user.user_metadata?.name as string | undefined) ??
      "account";
    return (
      <div className="flex items-center gap-2">
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element -- external GitHub avatar; next/image would need remote config
          <img
            src={avatar}
            alt={handle}
            width={28}
            height={28}
            className="h-7 w-7 rounded-full border border-ink-line"
          />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-ink-line text-paper-muted">
            <GithubIcon className="h-4 w-4" />
          </span>
        )}
        <button
          onClick={signOut}
          className="rounded-lg px-2.5 py-1.5 text-sm text-paper-muted transition-colors hover:bg-ink-glow hover:text-paper"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={signIn}
      className="inline-flex items-center gap-2 rounded-lg border border-ink-line px-3 py-1.5 text-sm text-paper-muted transition-colors hover:bg-ink-glow hover:text-paper"
    >
      <GithubIcon className="h-4 w-4" />
      Sign in
    </button>
  );
}

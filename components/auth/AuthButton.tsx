"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { User, LogOut } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import type { SupabaseClient, User as SupabaseUser } from "@supabase/supabase-js";

export function AuthButton() {
  const pathname = usePathname();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const clientRef = useRef<SupabaseClient | null>(null);

  // Lazily create the browser client (never during SSR/prerender, so the build
  // doesn't fail when env vars aren't set yet).
  const getClient = () => (clientRef.current ??= createClient());

  useEffect(() => {
    let supabase: SupabaseClient;
    try {
      supabase = getClient();
    } catch {
      return; // Supabase not configured yet.
    }
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = async () => {
    await getClient().auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
          pathname,
        )}`,
      },
    });
  };

  const signOut = async () => {
    await getClient().auth.signOut();
    setUser(null);
  };

  const avatar = user?.user_metadata?.avatar_url as string | undefined;

  return (
    <button
      onClick={user ? signOut : signIn}
      className="p-2 hover:bg-rose-light rounded-full transition-colors flex items-center gap-2"
      aria-label={user ? "Sign out" : "Sign in"}
      title={user ? "Sign out" : "Sign in"}
    >
      {user ? (
        <span className="flex items-center gap-2">
          {avatar ? (
            <Image
              src={avatar}
              alt="Account"
              width={24}
              height={24}
              className="w-6 h-6 rounded-full"
            />
          ) : (
            <User className="w-5 h-5" />
          )}
          <LogOut className="w-4 h-4 text-ink/40" />
        </span>
      ) : (
        <User className="w-5 h-5" />
      )}
    </button>
  );
}

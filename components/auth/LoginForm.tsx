"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { STORE_NAME } from "@/lib/constants";

export function LoginForm({
  next,
  error,
}: {
  next: string;
  error?: string;
}) {
  const [loading, setLoading] = useState(false);

  const signIn = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
          next,
        )}`,
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blush px-6">
      <Link href="/" className="text-3xl font-serif font-bold mb-2">
        {STORE_NAME.split("&")[0]}
        <span className="text-rose">&</span>
        {STORE_NAME.split("&")[1]}
      </Link>
      <p className="text-ink/50 mb-10 text-sm uppercase tracking-widest">
        Sign in to your account
      </p>

      <div className="bg-white rounded-3xl shadow-sm border border-rose-light p-8 w-full max-w-sm text-center">
        {error && (
          <p className="text-rose text-sm mb-4">
            Sign-in failed. Please try again.
          </p>
        )}
        <button
          onClick={signIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 border border-ink/15 rounded-full py-3.5 font-medium hover:border-rose hover:text-rose transition-all disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.57c2.08-1.92 3.27-4.74 3.27-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.76c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
            />
          </svg>
          {loading ? "Redirecting…" : "Continue with Google"}
        </button>
        <p className="text-xs text-ink/40 mt-6">
          You can also{" "}
          <Link href="/checkout" className="text-rose underline">
            check out as a guest
          </Link>
          .
        </p>
      </div>

      <Link href="/" className="mt-8 text-sm text-ink/50 hover:text-rose">
        ← Back to store
      </Link>
    </div>
  );
}

import { createClient } from "@supabase/supabase-js";

/**
 * Anonymous, cookie-less Supabase client for PUBLIC catalog reads
 * (products, categories). Because it doesn't touch cookies, pages using it can
 * be statically rendered / ISR-cached. RLS still applies (anon role).
 *
 * Returns null when env vars aren't configured yet, so the app builds and
 * renders a graceful empty state before Supabase is wired up.
 */
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function AdminSignOut({ email }: { email: string | null }) {
  const router = useRouter();
  const signOut = async () => {
    try {
      await createClient().auth.signOut();
    } catch {
      /* ignore */
    }
    router.push("/");
    router.refresh();
  };

  return (
    <div className="text-sm">
      {email && <p className="text-ink/40 truncate mb-2">{email}</p>}
      <button
        onClick={signOut}
        className="flex items-center gap-2 text-ink/60 hover:text-rose transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Sign out
      </button>
    </div>
  );
}

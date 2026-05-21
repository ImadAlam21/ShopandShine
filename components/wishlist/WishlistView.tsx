"use client";

import Link from "next/link";
import { useWishlist } from "@/components/wishlist/wishlist-store";
import { useHydrated } from "@/components/hooks/use-hydrated";

export function WishlistView({
  items,
}: {
  items: { id: string; node: React.ReactNode }[];
}) {
  const ids = useWishlist((s) => s.ids);
  const hydrated = useHydrated();

  if (!hydrated) {
    return <div className="py-20 text-center text-ink/40">Loading…</div>;
  }

  const chosen = items.filter((i) => ids.includes(i.id));

  if (chosen.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-ink/50 text-xl mb-4">
          Your wishlist is empty.
        </p>
        <Link
          href="/collections"
          className="text-rose font-bold uppercase tracking-widest text-sm"
        >
          Discover our jewellery
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-8">
      {chosen.map((i) => (
        <div key={i.id}>{i.node}</div>
      ))}
    </div>
  );
}

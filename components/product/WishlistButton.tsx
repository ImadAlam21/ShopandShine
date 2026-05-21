"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/components/wishlist/wishlist-store";
import { useHydrated } from "@/components/hooks/use-hydrated";
import { cn } from "@/lib/utils";

export function WishlistButton({
  id,
  className,
}: {
  id: string;
  className?: string;
}) {
  const ids = useWishlist((s) => s.ids);
  const toggle = useWishlist((s) => s.toggle);
  const hydrated = useHydrated();
  const active = hydrated && ids.includes(id);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        toggle(id);
      }}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={active}
      className={cn(
        "p-3 backdrop-blur-md rounded-full transition-colors",
        active ? "bg-rose text-white" : "bg-white/70 text-ink hover:bg-white",
        className,
      )}
    >
      <Heart className={cn("w-5 h-5", active && "fill-current")} />
    </button>
  );
}

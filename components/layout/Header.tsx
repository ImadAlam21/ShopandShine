"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, Search, ShoppingBag, Heart } from "lucide-react";
import { AuthButton } from "@/components/auth/AuthButton";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { SearchModal } from "@/components/search/SearchModal";
import { useCart, selectCount } from "@/components/cart/cart-store";
import { useWishlist } from "@/components/wishlist/wishlist-store";
import { useHydrated } from "@/components/hooks/use-hydrated";
import { STORE_NAME } from "@/lib/constants";
import type { Category } from "@/lib/types";

export function Header({ categories }: { categories: Category[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const items = useCart((s) => s.items);
  const openCart = useCart((s) => s.open);
  const wishlistIds = useWishlist((s) => s.ids);
  const hydrated = useHydrated();
  const cartCount = hydrated ? selectCount(items) : 0;
  const wishCount = hydrated ? wishlistIds.length : 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm py-3"
            : "bg-white/80 backdrop-blur-sm py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-6 flex justify-between items-center gap-4">
          <div className="flex items-center gap-6 flex-1">
            <button
              onClick={() => setMenuOpen(true)}
              className="p-2 hover:bg-rose-light rounded-full transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden md:flex gap-6 text-sm font-medium tracking-widest uppercase text-ink/60">
              <Link href="/collections" className="hover:text-rose transition-colors">
                Collections
              </Link>
              <Link href="/bespoke" className="hover:text-rose transition-colors">
                Bespoke
              </Link>
              <Link href="/story" className="hover:text-rose transition-colors">
                Our Story
              </Link>
            </div>
          </div>

          <Link
            href="/"
            className="text-xl md:text-3xl font-serif tracking-tight font-bold text-ink shrink-0"
          >
            {STORE_NAME.split("&")[0]}
            <span className="text-rose">&</span>
            {STORE_NAME.split("&")[1]}
          </Link>

          <div className="flex items-center gap-1 sm:gap-2 flex-1 justify-end">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 hover:bg-rose-light rounded-full transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <Link
              href="/wishlist"
              className="p-2 hover:bg-rose-light rounded-full transition-colors relative hidden sm:block"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishCount > 0 && (
                <span className="absolute top-0 right-0 bg-rose text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                  {wishCount}
                </span>
              )}
            </Link>
            <AuthButton />
            <button
              onClick={openCart}
              className="p-2 hover:bg-rose-light rounded-full transition-colors relative"
              aria-label="Open cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-rose text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        categories={categories}
      />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

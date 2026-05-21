import Link from "next/link";
import { Instagram, Facebook, Twitter } from "lucide-react";
import { STORE_NAME } from "@/lib/constants";
import type { Category } from "@/lib/types";

export function Footer({ categories }: { categories: Category[] }) {
  const year = new Date().getFullYear();
  return (
    <footer className="py-20 border-t border-rose-light bg-white">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-12">
        <div className="col-span-2">
          <h2 className="text-2xl font-serif font-bold mb-6">
            {STORE_NAME.split("&")[0]}
            <span className="text-rose">&</span>
            {STORE_NAME.split("&")[1]}
          </h2>
          <p className="text-ink/60 max-w-sm mb-8">
            Handcrafted jewellery designed to celebrate life&apos;s most precious
            moments.
          </p>
          <div className="flex gap-4">
            <a
              href="https://www.instagram.com/_shop_and_shine?igsh=MTF2bjMza3czMWVq"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-rose-light rounded-full hover:bg-rose hover:text-white transition-all"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-rose-light rounded-full hover:bg-rose hover:text-white transition-all"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-rose-light rounded-full hover:bg-rose hover:text-white transition-all"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div>
          <h5 className="font-bold uppercase text-xs tracking-widest mb-6">Shop</h5>
          <ul className="space-y-3 text-sm text-ink/60">
            <li>
              <Link href="/collections" className="hover:text-rose transition-colors">
                All Jewellery
              </Link>
            </li>
            {categories.slice(0, 5).map((c) => (
              <li key={c.id}>
                <Link
                  href={`/collections/${c.slug}`}
                  className="hover:text-rose transition-colors"
                >
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/bespoke" className="hover:text-rose transition-colors">
                Bespoke Service
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h5 className="font-bold uppercase text-xs tracking-widest mb-6">
            Support
          </h5>
          <ul className="space-y-3 text-sm text-ink/60">
            <li>
              <Link href="/shipping" className="hover:text-rose transition-colors">
                Shipping &amp; Returns
              </Link>
            </li>
            <li>
              <Link href="/care" className="hover:text-rose transition-colors">
                Care Guide
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-rose transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-rose transition-colors">
                Contact Us
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-12 mt-12 border-t border-rose-light flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-ink/40 uppercase tracking-widest font-bold">
        <p>
          © {year} {STORE_NAME} Jewellery. All rights reserved.
        </p>
        <div className="flex gap-6">
          <Link href="/privacy">Privacy</Link>
          <Link href="/shipping">Returns</Link>
        </div>
      </div>
    </footer>
  );
}

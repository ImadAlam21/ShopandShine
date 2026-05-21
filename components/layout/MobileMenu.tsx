"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { COLLECTION_TAGS } from "@/lib/constants";
import type { Category } from "@/lib/types";

export function MobileMenu({
  open,
  onClose,
  categories,
}: {
  open: boolean;
  onClose: () => void;
  categories: Category[];
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 220 }}
            className="fixed left-0 top-0 h-full w-full max-w-sm bg-white z-[70] shadow-2xl p-8 sm:p-10 overflow-y-auto"
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 hover:bg-rose-light rounded-full transition-colors"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="mt-10 space-y-8" onClick={onClose}>
              <div className="space-y-4">
                <h5 className="text-[10px] uppercase tracking-[0.3em] font-bold text-rose">
                  Shop
                </h5>
                <ul className="text-3xl font-serif space-y-3">
                  <li className="hover:italic hover:pl-2 transition-all">
                    <Link href="/collections">All Jewellery</Link>
                  </li>
                  {categories.map((c) => (
                    <li key={c.id} className="hover:italic hover:pl-2 transition-all">
                      <Link href={`/collections/${c.slug}`}>{c.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h5 className="text-[10px] uppercase tracking-[0.3em] font-bold text-rose">
                  Collections
                </h5>
                <ul className="text-xl font-serif space-y-3">
                  {COLLECTION_TAGS.map((tag) => (
                    <li key={tag} className="hover:text-rose transition-colors">
                      <Link href={`/collections?tag=${encodeURIComponent(tag)}`}>
                        {tag}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h5 className="text-[10px] uppercase tracking-[0.3em] font-bold text-rose">
                  Services
                </h5>
                <ul className="text-xl font-serif space-y-3">
                  <li className="hover:text-rose transition-colors">
                    <Link href="/bespoke">Bespoke Design</Link>
                  </li>
                  <li className="hover:text-rose transition-colors">
                    <Link href="/repair">Repair &amp; Care</Link>
                  </li>
                  <li className="hover:text-rose transition-colors">
                    <Link href="/appointment">Virtual Appointment</Link>
                  </li>
                  <li className="hover:text-rose transition-colors">
                    <Link href="/story">Our Story</Link>
                  </li>
                  <li className="hover:text-rose transition-colors">
                    <Link href="/contact">Contact</Link>
                  </li>
                </ul>
              </div>

              <div className="pt-8 border-t border-rose-light">
                <Link
                  href="/account/orders"
                  className="text-sm font-medium text-ink/60 hover:text-rose"
                >
                  My Orders
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

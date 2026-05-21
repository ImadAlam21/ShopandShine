"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Search, X } from "lucide-react";

const SUGGESTIONS = ["Rings", "Necklaces", "Earrings", "Bridal", "Gold"];

export function SearchModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const go = (term: string) => {
    const value = term.trim();
    if (!value) return;
    onClose();
    setQ("");
    router.push(`/collections?q=${encodeURIComponent(value)}`);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-[80]"
          />
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            className="fixed top-0 left-0 right-0 bg-white z-[90] shadow-xl p-6 sm:p-10"
          >
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-serif">Search</h3>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-rose-light rounded-full transition-colors"
                  aria-label="Close search"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  go(q);
                }}
                className="flex items-center gap-3 border-b-2 border-rose pb-3"
              >
                <Search className="w-6 h-6 text-rose" />
                <input
                  ref={inputRef}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search for rings, necklaces…"
                  className="flex-1 text-lg bg-transparent focus:outline-none placeholder:text-ink/30"
                />
              </form>
              <div className="mt-6 flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => go(s)}
                    className="px-4 py-2 text-sm rounded-full bg-rose-light text-rose hover:bg-rose hover:text-white transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

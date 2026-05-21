"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { useCart, selectCount, selectTotal } from "@/components/cart/cart-store";
import { useHydrated } from "@/components/hooks/use-hydrated";
import { formatINR } from "@/lib/format";

export function CartDrawer() {
  const { items, isOpen, close, removeItem, updateQuantity } = useCart();
  const hydrated = useHydrated();
  const count = hydrated ? selectCount(items) : 0;
  const total = hydrated ? selectTotal(items) : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-[60]"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 220 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-rose-light flex justify-between items-center">
              <h3 className="text-xl font-serif font-bold">Your Bag ({count})</h3>
              <button
                onClick={close}
                className="p-2 hover:bg-rose-light rounded-full transition-colors"
                aria-label="Close cart"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <ShoppingBag className="w-16 h-16 text-rose-light mb-4" />
                  <p className="text-ink/50">Your bag is empty.</p>
                  <button
                    onClick={close}
                    className="mt-6 text-rose font-bold uppercase tracking-widest text-sm"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={close}
                      className="relative w-24 h-32 shrink-0 rounded-2xl overflow-hidden bg-rose-light"
                    >
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </Link>
                    <div className="flex-1">
                      <div className="flex justify-between gap-2">
                        <Link
                          href={`/products/${item.slug}`}
                          onClick={close}
                          className="font-serif font-bold hover:text-rose"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-ink/40 hover:text-rose transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {item.category && (
                        <p className="text-xs text-ink/40 mt-1">{item.category}</p>
                      )}
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center border border-rose-light rounded-full px-2 py-1 gap-3">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 hover:bg-rose-light rounded-full"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-medium w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1 hover:bg-rose-light rounded-full disabled:opacity-30"
                            disabled={item.quantity >= item.stock}
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-rose font-medium">
                          {formatINR(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-rose-light bg-blush">
                <div className="flex justify-between mb-6">
                  <span className="text-ink/60">Subtotal</span>
                  <span className="text-xl font-serif font-bold">
                    {formatINR(total)}
                  </span>
                </div>
                <Link
                  href="/checkout"
                  onClick={close}
                  className="rose-button w-full py-4 text-sm uppercase tracking-[0.2em] font-bold"
                >
                  Checkout
                </Link>
                <p className="text-[10px] text-center text-ink/40 mt-4 uppercase tracking-widest">
                  Secure checkout · powered by Razorpay
                </p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

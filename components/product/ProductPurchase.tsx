"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { useCart } from "@/components/cart/cart-store";
import { WishlistButton } from "./WishlistButton";
import type { AddToCartInput } from "./AddToCartButton";

export function ProductPurchase({ product }: { product: AddToCartInput }) {
  const addItem = useCart((s) => s.addItem);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const out = product.stock <= 0;

  const add = () => {
    if (out) return;
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="flex flex-col gap-5">
      {!out && (
        <div className="flex items-center gap-4">
          <span className="text-xs uppercase tracking-widest text-ink/50 font-bold">
            Quantity
          </span>
          <div className="flex items-center border border-rose-light rounded-full px-3 py-2 gap-5">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="p-1 hover:bg-rose-light rounded-full"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-5 text-center font-medium">{qty}</span>
            <button
              onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
              disabled={qty >= product.stock}
              className="p-1 hover:bg-rose-light rounded-full disabled:opacity-30"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <span className="text-xs text-ink/40">{product.stock} in stock</span>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={add}
          disabled={out}
          className="rose-button flex-1 py-4 text-sm uppercase tracking-widest"
        >
          {out ? "Sold out" : added ? "Added to bag ✓" : "Add to Bag"}
        </button>
        <WishlistButton
          id={product.id}
          className="p-4 border border-rose-light"
        />
      </div>
    </div>
  );
}

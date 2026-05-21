"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/cart-store";
import { cn } from "@/lib/utils";

export interface AddToCartInput {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  category: string | null;
  stock: number;
}

export function AddToCartButton({
  product,
  variant = "overlay",
  className,
}: {
  product: AddToCartInput;
  variant?: "overlay" | "solid";
  className?: string;
}) {
  const addItem = useCart((s) => s.addItem);
  const [added, setAdded] = useState(false);
  const out = product.stock <= 0;

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (out) return;
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const label = out ? "Sold out" : added ? "Added ✓" : "Add to Bag";

  if (variant === "solid") {
    return (
      <button
        onClick={onClick}
        disabled={out}
        className={cn("rose-button", className)}
      >
        {out ? "Sold out" : added ? "Added to bag ✓" : "Add to Bag"}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={out}
      className={cn(
        "absolute bottom-4 inset-x-4 bg-white/90 backdrop-blur-md py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all duration-300 hover:bg-rose hover:text-white opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 disabled:opacity-100 disabled:translate-y-0 disabled:bg-ink/5 disabled:text-ink/40 disabled:hover:bg-ink/5",
        className,
      )}
    >
      {label}
    </button>
  );
}

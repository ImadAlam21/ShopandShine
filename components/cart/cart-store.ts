"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartLine {
  id: string; // product id
  slug: string;
  name: string;
  price: number; // rupees
  image: string;
  category: string | null;
  stock: number;
  quantity: number;
}

interface CartState {
  items: CartLine[];
  isOpen: boolean;
  addItem: (item: Omit<CartLine, "quantity">, qty?: number) => void;
  removeItem: (id: string) => void;
  setQuantity: (id: string, qty: number) => void;
  updateQuantity: (id: string, delta: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
}

const clampToStock = (qty: number, stock: number) =>
  Math.max(1, Math.min(qty, Math.max(stock, 1)));

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      addItem: (item, qty = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.id === item.id
                  ? { ...i, ...item, quantity: clampToStock(i.quantity + qty, item.stock) }
                  : i,
              ),
              isOpen: true,
            };
          }
          return {
            items: [...s.items, { ...item, quantity: clampToStock(qty, item.stock) }],
            isOpen: true,
          };
        }),
      removeItem: (id) =>
        set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      setQuantity: (id, qty) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.id === id ? { ...i, quantity: clampToStock(qty, i.stock) } : i,
          ),
        })),
      updateQuantity: (id, delta) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.id === id
              ? { ...i, quantity: clampToStock(i.quantity + delta, i.stock) }
              : i,
          ),
        })),
      clear: () => set({ items: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
    }),
    { name: "ss-cart" },
  ),
);

export const selectCount = (items: CartLine[]) =>
  items.reduce((n, i) => n + i.quantity, 0);

export const selectTotal = (items: CartLine[]) =>
  items.reduce((n, i) => n + i.price * i.quantity, 0);

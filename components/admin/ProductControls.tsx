"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import {
  setProductActive,
  setProductStock,
  deleteProduct,
} from "@/app/admin/actions";
import { cn } from "@/lib/utils";

export function ActiveToggle({ id, active }: { id: string; active: boolean }) {
  const [on, setOn] = useState(active);
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => {
        const next = !on;
        setOn(next);
        start(() => setProductActive(id, next));
      }}
      className={cn(
        "px-3 py-1 rounded-full text-xs font-bold transition-colors disabled:opacity-50",
        on ? "bg-green-100 text-green-700" : "bg-ink/10 text-ink/50",
      )}
    >
      {on ? "Active" : "Hidden"}
    </button>
  );
}

export function StockEditor({ id, stock }: { id: string; stock: number }) {
  const [val, setVal] = useState(stock);
  const [pending, start] = useTransition();
  const save = () => {
    if (val !== stock) start(() => setProductStock(id, val));
  };
  return (
    <input
      type="number"
      min={0}
      value={val}
      disabled={pending}
      onChange={(e) => setVal(Number(e.target.value))}
      onBlur={save}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
      }}
      className="w-16 border border-rose-light rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-rose/40"
    />
  );
}

export function DeleteProductButton({
  id,
  label,
}: {
  id: string;
  label?: string;
}) {
  const [pending, start] = useTransition();
  const onDelete = () => {
    if (confirm("Delete this product? This cannot be undone.")) {
      start(() => deleteProduct(id));
    }
  };
  if (label) {
    return (
      <button
        disabled={pending}
        onClick={onDelete}
        className="text-rose border border-rose/40 rounded-full px-5 py-2 text-sm font-medium hover:bg-rose hover:text-white transition-colors disabled:opacity-50"
      >
        {pending ? "Deleting…" : label}
      </button>
    );
  }
  return (
    <button
      disabled={pending}
      onClick={onDelete}
      className="text-ink/40 hover:text-rose transition-colors disabled:opacity-50"
      aria-label="Delete product"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}

"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import {
  updateOrderStatus,
  setContactRead,
  updateBespokeStatus,
  deleteCategory,
} from "@/app/admin/actions";
import type { OrderStatus } from "@/lib/types";

const selectCls =
  "border border-rose-light rounded-full px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose/40 disabled:opacity-50";

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "paid",
  "failed",
  "fulfilled",
  "cancelled",
  "refunded",
];

export function OrderStatusSelect({
  id,
  status,
}: {
  id: string;
  status: OrderStatus;
}) {
  const [pending, start] = useTransition();
  return (
    <select
      defaultValue={status}
      disabled={pending}
      onChange={(e) =>
        start(() => updateOrderStatus(id, e.target.value as OrderStatus))
      }
      className={selectCls}
    >
      {ORDER_STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}

const BESPOKE_STATUSES = ["new", "contacted", "in_progress", "closed"];

export function BespokeStatusSelect({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const [pending, start] = useTransition();
  return (
    <select
      defaultValue={status}
      disabled={pending}
      onChange={(e) => start(() => updateBespokeStatus(id, e.target.value))}
      className={selectCls}
    >
      {BESPOKE_STATUSES.map((s) => (
        <option key={s} value={s}>
          {s.replace("_", " ")}
        </option>
      ))}
    </select>
  );
}

export function ContactReadToggle({
  id,
  read,
}: {
  id: string;
  read: boolean;
}) {
  const [isRead, setIsRead] = useState(read);
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => {
        const next = !isRead;
        setIsRead(next);
        start(() => setContactRead(id, next));
      }}
      className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full transition-colors disabled:opacity-50 ${
        isRead ? "bg-ink/10 text-ink/50" : "bg-rose text-white"
      }`}
    >
      {isRead ? "Read" : "New"}
    </button>
  );
}

export function DeleteCategoryButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => {
        if (
          confirm(
            "Delete this category? Products will remain but lose this category.",
          )
        ) {
          start(() => deleteCategory(id));
        }
      }}
      className="text-ink/40 hover:text-rose transition-colors disabled:opacity-50"
      aria-label="Delete category"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}

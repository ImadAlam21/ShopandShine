import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatPaise } from "@/lib/format";

export const metadata: Metadata = {
  title: "Order Confirmation",
  robots: { index: false },
};

interface OrderItemRow {
  product_name: string;
  quantity: number;
  line_total_paise: number;
}
interface OrderRow {
  order_number: string;
  email: string;
  total_paise: number;
  status: string;
  created_at: string;
  order_items: OrderItemRow[];
}

export default async function OrderPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;

  let order: OrderRow | null = null;
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("orders")
      .select(
        "order_number, email, total_paise, status, created_at, order_items(product_name, quantity, line_total_paise)",
      )
      .eq("order_number", orderNumber)
      .maybeSingle();
    order = data as unknown as OrderRow | null;
  } catch {
    order = null;
  }

  if (!order) notFound();

  const paid = order.status === "paid" || order.status === "fulfilled";

  return (
    <div className="pt-28 sm:pt-32 pb-24 max-w-2xl mx-auto px-6 text-center">
      <CheckCircle2
        className={`w-16 h-16 mx-auto mb-6 ${paid ? "text-rose" : "text-ink/30"}`}
      />
      <h1 className="text-4xl sm:text-5xl font-serif mb-4">
        {paid ? "Thank you!" : "Order received"}
      </h1>
      <p className="text-ink/60 mb-2">
        {paid
          ? "Your order has been confirmed."
          : "We're awaiting payment confirmation for this order."}
      </p>
      <p className="text-sm uppercase tracking-widest text-ink/40 mb-10">
        Order {order.order_number}
      </p>

      <div className="bg-blush rounded-3xl p-6 text-left mb-10">
        <div className="space-y-3 mb-4">
          {order.order_items?.map((it, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span>
                {it.product_name}{" "}
                <span className="text-ink/40">× {it.quantity}</span>
              </span>
              <span>{formatPaise(it.line_total_paise)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-rose-light pt-4 flex justify-between font-serif font-bold text-lg">
          <span>Total</span>
          <span>{formatPaise(order.total_paise)}</span>
        </div>
      </div>

      <p className="text-sm text-ink/50 mb-8">
        A confirmation has been sent to {order.email}.
      </p>

      <div className="flex justify-center gap-4">
        <Link href="/collections" className="rose-button">
          Continue Shopping
        </Link>
        <Link href="/account/orders" className="outline-button">
          My Orders
        </Link>
      </div>
    </div>
  );
}

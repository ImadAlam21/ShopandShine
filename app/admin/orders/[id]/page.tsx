import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatPaise } from "@/lib/format";
import { OrderStatusSelect } from "@/components/admin/AdminInline";
import type { OrderStatus, ShippingAddress } from "@/lib/types";

interface ItemRow {
  product_name: string;
  quantity: number;
  unit_price_paise: number;
  line_total_paise: number;
}
interface OrderDetail {
  id: string;
  order_number: string;
  email: string;
  phone: string | null;
  shipping_name: string | null;
  shipping_address: ShippingAddress | null;
  subtotal_paise: number;
  shipping_paise: number;
  total_paise: number;
  status: OrderStatus;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  created_at: string;
  order_items: ItemRow[];
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let order: OrderDetail | null = null;
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("orders")
      .select("*, order_items(product_name, quantity, unit_price_paise, line_total_paise)")
      .eq("id", id)
      .maybeSingle();
    order = data as unknown as OrderDetail | null;
  } catch {
    order = null;
  }
  if (!order) notFound();

  const addr = order.shipping_address;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/orders" className="text-sm text-ink/50 hover:text-rose">
          ← Back to orders
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
          <h1 className="text-3xl font-serif">{order.order_number}</h1>
          <OrderStatusSelect id={order.id} status={order.status} />
        </div>
        <p className="text-sm text-ink/40 mt-1">
          {new Date(order.created_at).toLocaleString("en-IN")}
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-rose-light p-6">
          <h2 className="text-lg font-serif mb-4">Customer</h2>
          <p className="text-sm">{order.shipping_name}</p>
          <p className="text-sm text-ink/60">{order.email}</p>
          {order.phone && <p className="text-sm text-ink/60">{order.phone}</p>}
          {addr && (
            <div className="text-sm text-ink/60 mt-4 leading-relaxed">
              <p>{addr.line1}</p>
              {addr.line2 && <p>{addr.line2}</p>}
              <p>
                {addr.city}, {addr.state} {addr.pincode}
              </p>
              <p>{addr.country}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-rose-light p-6">
          <h2 className="text-lg font-serif mb-4">Payment</h2>
          <dl className="text-sm space-y-2">
            <div className="flex justify-between">
              <dt className="text-ink/50">Razorpay order</dt>
              <dd className="font-mono text-xs">
                {order.razorpay_order_id ?? "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink/50">Razorpay payment</dt>
              <dd className="font-mono text-xs">
                {order.razorpay_payment_id ?? "—"}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-rose-light p-6">
        <h2 className="text-lg font-serif mb-4">Items</h2>
        <div className="space-y-3">
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
        <div className="border-t border-rose-light mt-4 pt-4 space-y-2 text-sm">
          <div className="flex justify-between text-ink/60">
            <span>Subtotal</span>
            <span>{formatPaise(order.subtotal_paise)}</span>
          </div>
          <div className="flex justify-between text-ink/60">
            <span>Shipping</span>
            <span>{formatPaise(order.shipping_paise)}</span>
          </div>
          <div className="flex justify-between font-serif font-bold text-lg pt-1">
            <span>Total</span>
            <span>{formatPaise(order.total_paise)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

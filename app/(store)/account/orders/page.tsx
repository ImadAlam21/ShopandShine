import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { formatPaise } from "@/lib/format";

export const metadata: Metadata = {
  title: "My Orders",
  robots: { index: false },
};

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  fulfilled: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  failed: "bg-rose-light text-rose",
  cancelled: "bg-ink/10 text-ink/60",
  refunded: "bg-ink/10 text-ink/60",
};

export default async function AccountOrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account/orders");

  const supabase = await createClient();
  // RLS ensures only this user's orders are returned.
  const { data: orders } = await supabase
    .from("orders")
    .select("order_number, total_paise, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="pt-28 sm:pt-32 pb-24 max-w-3xl mx-auto px-6">
      <h1 className="text-4xl sm:text-5xl font-serif mb-10">My Orders</h1>

      {!orders || orders.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-ink/50 text-lg mb-4">No orders yet.</p>
          <Link
            href="/collections"
            className="text-rose font-bold uppercase tracking-widest text-sm"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <Link
              key={o.order_number}
              href={`/order/${o.order_number}`}
              className="flex items-center justify-between p-5 rounded-2xl border border-rose-light hover:shadow-md transition-shadow"
            >
              <div>
                <p className="font-medium">{o.order_number}</p>
                <p className="text-xs text-ink/40">
                  {new Date(o.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="text-right flex items-center gap-4">
                <span
                  className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full ${
                    STATUS_STYLES[o.status] ?? "bg-ink/10 text-ink/60"
                  }`}
                >
                  {o.status}
                </span>
                <span className="font-medium">
                  {formatPaise(o.total_paise)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

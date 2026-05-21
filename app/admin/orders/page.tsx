import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatPaise } from "@/lib/format";

interface OrderRow {
  id: string;
  order_number: string;
  email: string;
  total_paise: number;
  status: string;
  created_at: string;
}

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  fulfilled: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  failed: "bg-rose-light text-rose",
  cancelled: "bg-ink/10 text-ink/60",
  refunded: "bg-ink/10 text-ink/60",
};

export default async function AdminOrdersPage() {
  let orders: OrderRow[] = [];
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("orders")
      .select("id, order_number, email, total_paise, status, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    orders = (data as OrderRow[]) ?? [];
  } catch {
    orders = [];
  }

  return (
    <div>
      <h1 className="text-3xl font-serif mb-8">Orders</h1>

      <div className="bg-white rounded-2xl border border-rose-light overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ink/40 uppercase tracking-widest text-[10px] border-b border-rose-light">
              <th className="p-4">Order</th>
              <th className="p-4 hidden sm:table-cell">Customer</th>
              <th className="p-4 hidden sm:table-cell">Date</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-10 text-center text-ink/40">
                  No orders yet.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr
                  key={o.id}
                  className="border-b border-rose-light/60 last:border-0"
                >
                  <td className="p-4">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="font-medium hover:text-rose"
                    >
                      {o.order_number}
                    </Link>
                  </td>
                  <td className="p-4 hidden sm:table-cell text-ink/60">
                    {o.email}
                  </td>
                  <td className="p-4 hidden sm:table-cell text-ink/60">
                    {new Date(o.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="p-4">{formatPaise(o.total_paise)}</td>
                  <td className="p-4">
                    <span
                      className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full ${
                        STATUS_STYLES[o.status] ?? "bg-ink/10 text-ink/60"
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

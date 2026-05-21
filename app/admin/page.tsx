import Link from "next/link";
import { Package, ShoppingCart, Mail, AlertTriangle } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminDashboard() {
  let stats = {
    products: 0,
    lowStock: 0,
    pending: 0,
    paid: 0,
    unread: 0,
    bespoke: 0,
  };

  try {
    const admin = createAdminClient();
    const head = { count: "exact" as const, head: true };
    const [products, lowStock, pending, paid, unread, bespoke] =
      await Promise.all([
        admin.from("products").select("*", head),
        admin.from("products").select("*", head).lte("stock", 3),
        admin.from("orders").select("*", head).eq("status", "pending"),
        admin.from("orders").select("*", head).eq("status", "paid"),
        admin.from("contact_messages").select("*", head).eq("is_read", false),
        admin.from("bespoke_inquiries").select("*", head).eq("status", "new"),
      ]);
    stats = {
      products: products.count ?? 0,
      lowStock: lowStock.count ?? 0,
      pending: pending.count ?? 0,
      paid: paid.count ?? 0,
      unread: unread.count ?? 0,
      bespoke: bespoke.count ?? 0,
    };
  } catch {
    // Supabase not configured yet — show zeros.
  }

  const cards = [
    {
      label: "Products",
      value: stats.products,
      href: "/admin/products",
      icon: Package,
    },
    {
      label: "Paid orders",
      value: stats.paid,
      href: "/admin/orders",
      icon: ShoppingCart,
    },
    {
      label: "Unread messages",
      value: stats.unread,
      href: "/admin/inquiries/contact",
      icon: Mail,
    },
    {
      label: "Low stock (≤3)",
      value: stats.lowStock,
      href: "/admin/products",
      icon: AlertTriangle,
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-serif mb-2">Dashboard</h1>
      <p className="text-ink/50 mb-8">
        Welcome back. Here&apos;s your store at a glance.
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.label}
              href={c.href}
              className="bg-white rounded-2xl p-5 border border-rose-light hover:shadow-md transition-shadow"
            >
              <Icon className="w-5 h-5 text-rose mb-3" />
              <p className="text-3xl font-serif font-bold">{c.value}</p>
              <p className="text-xs text-ink/50 mt-1">{c.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl p-6 border border-rose-light">
        <h2 className="text-lg font-serif mb-4">Quick actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/products/new" className="rose-button">
            + Add product
          </Link>
          <Link href="/admin/categories" className="outline-button">
            Manage categories
          </Link>
          <Link href="/admin/orders" className="outline-button">
            View orders
          </Link>
        </div>
      </div>
    </div>
  );
}

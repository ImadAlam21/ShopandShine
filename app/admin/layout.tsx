import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminSignOut } from "@/components/admin/AdminSignOut";
import { STORE_NAME } from "@/lib/constants";

export const metadata = { title: "Admin", robots: { index: false } };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Authorization is enforced here (not just middleware).
  const profile = await requireAdmin();

  return (
    <div className="min-h-screen bg-blush flex flex-col lg:flex-row">
      <aside className="lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-rose-light lg:min-h-screen flex flex-col">
        <div className="p-6">
          <Link href="/admin" className="font-serif font-bold text-xl">
            {STORE_NAME.split("&")[0]}
            <span className="text-rose">&</span>
            {STORE_NAME.split("&")[1]}
          </Link>
          <p className="text-[10px] uppercase tracking-[0.3em] text-rose mt-1">
            Admin
          </p>
        </div>
        <div className="pb-4">
          <AdminNav />
        </div>
        <div className="mt-auto p-6 border-t border-rose-light hidden lg:block">
          <Link
            href="/"
            className="block text-sm text-ink/60 hover:text-rose mb-4"
          >
            ← View store
          </Link>
          <AdminSignOut email={profile.email} />
        </div>
      </aside>
      <main className="flex-1 p-5 sm:p-8 lg:p-10 max-w-6xl">{children}</main>
    </div>
  );
}

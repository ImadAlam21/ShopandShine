import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { productImageUrl } from "@/lib/images";
import { formatINR } from "@/lib/format";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import {
  ActiveToggle,
  StockEditor,
  DeleteProductButton,
} from "@/components/admin/ProductControls";

interface AdminProductRow {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  is_active: boolean;
  category: { name: string } | { name: string }[] | null;
  product_images: { storage_path: string; is_primary: boolean }[] | null;
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  let products: AdminProductRow[] = [];

  try {
    const admin = createAdminClient();
    let query = admin
      .from("products")
      .select(
        "id, name, slug, price, stock, is_active, category:categories(name), product_images(storage_path, is_primary)",
      )
      .order("created_at", { ascending: false });
    if (q?.trim()) query = query.ilike("name", `%${q.trim()}%`);
    const { data } = await query;
    products = (data as unknown as AdminProductRow[]) ?? [];
  } catch {
    products = [];
  }

  const imageOf = (row: AdminProductRow) => {
    const imgs = row.product_images ?? [];
    const primary = imgs.find((i) => i.is_primary) ?? imgs[0];
    return primary ? productImageUrl(primary.storage_path) : PLACEHOLDER_IMAGE;
  };
  const categoryOf = (row: AdminProductRow) =>
    Array.isArray(row.category)
      ? (row.category[0]?.name ?? "—")
      : (row.category?.name ?? "—");

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-serif">Products</h1>
        <Link href="/admin/products/new" className="rose-button">
          + Add product
        </Link>
      </div>

      <form className="relative mb-6 max-w-sm">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
        <input
          name="q"
          defaultValue={q}
          placeholder="Search products…"
          className="field pl-10"
        />
      </form>

      <div className="bg-white rounded-2xl border border-rose-light overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ink/40 uppercase tracking-widest text-[10px] border-b border-rose-light">
              <th className="p-4">Product</th>
              <th className="p-4 hidden sm:table-cell">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-10 text-center text-ink/40">
                  No products yet.{" "}
                  <Link href="/admin/products/new" className="text-rose">
                    Add your first product
                  </Link>
                  .
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-rose-light/60 last:border-0"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-rose-light shrink-0">
                        <Image
                          src={imageOf(p)}
                          alt=""
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="font-medium hover:text-rose"
                      >
                        {p.name}
                      </Link>
                    </div>
                  </td>
                  <td className="p-4 hidden sm:table-cell text-ink/60">
                    {categoryOf(p)}
                  </td>
                  <td className="p-4">{formatINR(Number(p.price))}</td>
                  <td className="p-4">
                    <StockEditor id={p.id} stock={p.stock} />
                  </td>
                  <td className="p-4">
                    <ActiveToggle id={p.id} active={p.is_active} />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-4">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="text-rose hover:underline"
                      >
                        Edit
                      </Link>
                      <DeleteProductButton id={p.id} />
                    </div>
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

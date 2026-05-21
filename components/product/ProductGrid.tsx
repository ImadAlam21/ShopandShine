import Link from "next/link";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/lib/types";

export function ProductGrid({
  products,
  emptyMessage = "No products found.",
}: {
  products: Product[];
  emptyMessage?: string;
}) {
  if (products.length === 0) {
    return (
      <div className="col-span-full py-20 text-center">
        <p className="text-ink/50 text-xl">{emptyMessage}</p>
        <Link
          href="/collections"
          className="mt-4 inline-block text-rose font-bold uppercase tracking-widest text-sm"
        >
          View all jewellery
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-8">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

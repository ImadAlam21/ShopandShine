import type { Metadata } from "next";
import { getProducts } from "@/lib/queries";
import { ProductCard } from "@/components/product/ProductCard";
import { WishlistView } from "@/components/wishlist/WishlistView";

export const metadata: Metadata = {
  title: "Wishlist",
  robots: { index: false },
};

export default async function WishlistPage() {
  // Wishlist ids live in the browser; pre-render every card and let the client
  // pick which to show. Fine for a boutique-sized catalog.
  const products = await getProducts({ limit: 200 });
  const items = products.map((p) => ({
    id: p.id,
    node: <ProductCard product={p} />,
  }));

  return (
    <div className="pt-28 sm:pt-32 pb-24 max-w-7xl mx-auto px-6">
      <h1 className="text-4xl sm:text-5xl font-serif mb-10">Your Wishlist</h1>
      <WishlistView items={items} />
    </div>
  );
}

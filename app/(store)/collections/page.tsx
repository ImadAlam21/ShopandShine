import type { Metadata } from "next";
import { getProducts, type ProductQuery } from "@/lib/queries";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SortSelect } from "@/components/product/SortSelect";

export const metadata: Metadata = {
  title: "All Jewellery",
  description: "Browse the complete Shop & Shine collection of handcrafted jewellery.",
};

type Sort = NonNullable<ProductQuery["sort"]>;
const SORTS: Sort[] = ["newest", "price_asc", "price_desc", "name"];

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string; sort?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() || undefined;
  const tag = sp.tag?.trim() || undefined;
  const sort: Sort = SORTS.includes(sp.sort as Sort)
    ? (sp.sort as Sort)
    : "newest";

  const products = await getProducts({ search: q, tag, sort });

  const title = tag
    ? `${tag} Collection`
    : q
      ? "Search Results"
      : "All Jewellery";

  const params: Record<string, string> = {};
  if (q) params.q = q;
  if (tag) params.tag = tag;

  return (
    <div className="pt-28 sm:pt-32 pb-24 max-w-7xl mx-auto px-6">
      <div className="mb-10 sm:mb-14 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
        <div>
          <h1 className="text-4xl sm:text-5xl font-serif mb-3">{title}</h1>
          <p className="text-ink/50">
            {q
              ? `Showing results for “${q}”`
              : "Discover our complete range of handcrafted jewellery."}
          </p>
        </div>
        <SortSelect sort={sort} params={params} />
      </div>

      <ProductGrid
        products={products}
        emptyMessage={
          q
            ? `No products match “${q}”.`
            : "No products here yet — check back soon."
        }
      />
    </div>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getProducts, type ProductQuery } from "@/lib/queries";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SortSelect } from "@/components/product/SortSelect";

type Sort = NonNullable<ProductQuery["sort"]>;
const SORTS: Sort[] = ["newest", "price_asc", "price_desc", "name"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const cat = await getCategoryBySlug(category);
  if (!cat) return { title: "Collection" };
  return {
    title: cat.name,
    description: cat.description ?? `Shop our ${cat.name} collection.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ sort?: string }>;
}) {
  const { category } = await params;
  const sp = await searchParams;
  const cat = await getCategoryBySlug(category);
  if (!cat) notFound();

  const sort: Sort = SORTS.includes(sp.sort as Sort)
    ? (sp.sort as Sort)
    : "newest";
  const products = await getProducts({ categoryId: cat.id, sort });

  return (
    <div className="pt-28 sm:pt-32 pb-24 max-w-7xl mx-auto px-6">
      <div className="mb-10 sm:mb-14 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
        <div>
          <h1 className="text-4xl sm:text-5xl font-serif mb-3">{cat.name}</h1>
          <p className="text-ink/50">
            {cat.description ?? `Explore our ${cat.name.toLowerCase()}.`}
          </p>
        </div>
        <SortSelect
          sort={sort}
          params={{}}
          basePath={`/collections/${cat.slug}`}
        />
      </div>

      <ProductGrid
        products={products}
        emptyMessage="No products in this collection yet."
      />
    </div>
  );
}

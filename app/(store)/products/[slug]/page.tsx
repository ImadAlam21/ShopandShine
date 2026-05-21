import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getProductBySlug,
  getAllProductSlugs,
  getRelatedProducts,
} from "@/lib/queries";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductPurchase } from "@/components/product/ProductPurchase";
import { ProductGrid } from "@/components/product/ProductGrid";
import { formatINR } from "@/lib/format";
import { STORE_NAME } from "@/lib/constants";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: product.name,
    description:
      product.description ??
      `${product.name} — handcrafted jewellery at ${STORE_NAME}.`,
    openGraph: {
      title: product.name,
      description: product.description ?? undefined,
      images: product.images.length ? product.images.map((i) => i.url) : undefined,
      type: "website",
    },
    alternates: { canonical: `/products/${product.slug}` },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product, 4);
  const onSale =
    product.compareAtPrice != null && product.compareAtPrice > product.price;

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: product.images.map((i) => i.url),
    description: product.description ?? undefined,
    sku: product.sku ?? undefined,
    brand: { "@type": "Brand", name: STORE_NAME },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="pt-28 sm:pt-32 pb-24 max-w-7xl mx-auto px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="text-xs uppercase tracking-widest text-ink/40 mb-8 flex gap-2">
        <Link href="/" className="hover:text-rose">
          Home
        </Link>
        <span>/</span>
        <Link href="/collections" className="hover:text-rose">
          Jewellery
        </Link>
        {product.category && (
          <>
            <span>/</span>
            <Link
              href={`/collections/${product.category.slug}`}
              className="hover:text-rose"
            >
              {product.category.name}
            </Link>
          </>
        )}
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        <ProductGallery images={product.images} name={product.name} />

        <div className="lg:pt-6">
          {product.category && (
            <Link
              href={`/collections/${product.category.slug}`}
              className="text-xs uppercase tracking-[0.2em] text-rose font-bold"
            >
              {product.category.name}
            </Link>
          )}
          <h1 className="text-4xl sm:text-5xl font-serif mt-3 mb-5">
            {product.name}
          </h1>

          <div className="flex items-center gap-4 mb-6">
            <span className="text-2xl font-medium text-rose">
              {formatINR(product.price)}
            </span>
            {onSale && (
              <span className="text-lg text-ink/30 line-through">
                {formatINR(product.compareAtPrice!)}
              </span>
            )}
          </div>

          {product.description && (
            <p className="text-ink/70 leading-relaxed mb-8">
              {product.description}
            </p>
          )}

          <div className="mb-8">
            {product.stock > 0 ? (
              <span className="inline-flex items-center gap-2 text-sm text-green-700">
                <span className="w-2 h-2 rounded-full bg-green-600" />
                In stock
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 text-sm text-ink/50">
                <span className="w-2 h-2 rounded-full bg-ink/40" />
                Currently sold out
              </span>
            )}
          </div>

          <ProductPurchase
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              image: product.primaryImage,
              category: product.category?.name ?? null,
              stock: product.stock,
            }}
          />

          {product.tags.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2">
              {product.tags.map((t) => (
                <Link
                  key={t}
                  href={`/collections?tag=${encodeURIComponent(t)}`}
                  className="px-3 py-1.5 text-xs rounded-full bg-rose-light text-rose hover:bg-rose hover:text-white transition-colors"
                >
                  {t}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="text-3xl font-serif mb-10">You may also like</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}

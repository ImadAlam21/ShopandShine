import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { getCategories } from "@/lib/queries";
import { createAdminClient } from "@/lib/supabase/admin";
import { productImageUrl } from "@/lib/images";
import { ProductForm, type ProductFormValues } from "@/components/admin/ProductForm";
import { ImageManager, type AdminImage } from "@/components/admin/ImageManager";
import { DeleteProductButton } from "@/components/admin/ProductControls";
import { updateProduct } from "@/app/admin/actions";

interface RawImage {
  id: string;
  storage_path: string;
  position: number;
  is_primary: boolean;
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let product:
    | (ProductFormValues & { id: string; slug: string })
    | null = null;
  let images: AdminImage[] = [];

  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("products")
      .select("*, product_images(*)")
      .eq("id", id)
      .maybeSingle();

    if (data) {
      const imgs = (data.product_images ?? []) as RawImage[];
      images = imgs
        .slice()
        .sort(
          (a, b) =>
            Number(b.is_primary) - Number(a.is_primary) ||
            a.position - b.position,
        )
        .map((img) => ({
          id: img.id,
          url: productImageUrl(img.storage_path),
          storagePath: img.storage_path,
          isPrimary: img.is_primary,
        }));

      product = {
        id: data.id,
        name: data.name,
        slug: data.slug,
        price: Number(data.price),
        compareAtPrice:
          data.compare_at_price != null ? Number(data.compare_at_price) : null,
        stock: data.stock,
        sku: data.sku,
        categoryId: data.category_id,
        description: data.description,
        tags: data.tags ?? [],
        isActive: data.is_active,
        isFeatured: data.is_featured,
        isNew: data.is_new,
      };
    }
  } catch {
    product = null;
  }

  if (!product) notFound();

  const categories = await getCategories();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/products"
            className="text-sm text-ink/50 hover:text-rose"
          >
            ← Back to products
          </Link>
          <h1 className="text-3xl font-serif mt-2">{product.name}</h1>
        </div>
        <Link
          href={`/products/${product.slug}`}
          target="_blank"
          className="text-sm text-rose hover:underline inline-flex items-center gap-1"
        >
          View on store <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      <ProductForm
        action={updateProduct.bind(null, id)}
        categories={categories}
        product={product}
      />

      <ImageManager productId={id} images={images} />

      <div className="bg-white p-6 rounded-2xl border border-rose-light">
        <h2 className="text-lg font-serif mb-1">Danger zone</h2>
        <p className="text-sm text-ink/50 mb-4">
          Permanently delete this product and its images.
        </p>
        <DeleteProductButton id={id} label="Delete product" />
      </div>
    </div>
  );
}

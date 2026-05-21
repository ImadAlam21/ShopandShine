import { PLACEHOLDER_IMAGE, PRODUCT_BUCKET } from "@/lib/constants";

/**
 * Build the public URL for a product image stored in Supabase Storage.
 * `storagePath` is the path inside the bucket, e.g. "products/<id>/<file>.webp".
 * Already-absolute URLs (legacy placeholders) are returned as-is.
 */
export function productImageUrl(storagePath: string | null | undefined): string {
  if (!storagePath) return PLACEHOLDER_IMAGE;
  if (storagePath.startsWith("http://") || storagePath.startsWith("https://")) {
    return storagePath;
  }
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return PLACEHOLDER_IMAGE;
  return `${base}/storage/v1/object/public/${PRODUCT_BUCKET}/${storagePath}`;
}

import "server-only";
import { createPublicClient } from "@/lib/supabase/public";
import { productImageUrl } from "@/lib/images";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import type { Category, Product, ProductImage } from "@/lib/types";

const PRODUCT_SELECT = `
  id, name, slug, description, price, compare_at_price, stock, sku,
  is_active, is_featured, is_new, tags, created_at,
  category:categories ( name, slug ),
  images:product_images ( storage_path, alt_text, position, is_primary )
`;

interface RawImage {
  storage_path: string;
  alt_text: string | null;
  position: number;
  is_primary: boolean;
}
interface RawCategoryRef {
  name: string;
  slug: string;
}
interface RawProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  stock: number;
  sku: string | null;
  is_active: boolean;
  is_featured: boolean;
  is_new: boolean;
  tags: string[] | null;
  created_at: string;
  category: RawCategoryRef | RawCategoryRef[] | null;
  images: RawImage[] | null;
}

function mapProduct(row: RawProduct): Product {
  const cat = Array.isArray(row.category) ? (row.category[0] ?? null) : row.category;
  const images: ProductImage[] = (row.images ?? [])
    .slice()
    .sort(
      (a, b) =>
        Number(b.is_primary) - Number(a.is_primary) || a.position - b.position,
    )
    .map((img) => ({
      url: productImageUrl(img.storage_path),
      alt: img.alt_text ?? row.name,
      isPrimary: img.is_primary,
      position: img.position,
    }));

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: Number(row.price),
    compareAtPrice:
      row.compare_at_price != null ? Number(row.compare_at_price) : null,
    stock: row.stock,
    sku: row.sku,
    isActive: row.is_active,
    isFeatured: row.is_featured,
    isNew: row.is_new,
    tags: row.tags ?? [],
    category: cat ? { name: cat.name, slug: cat.slug } : null,
    images,
    primaryImage: images[0]?.url ?? PLACEHOLDER_IMAGE,
    createdAt: row.created_at,
  };
}

export interface ProductQuery {
  categoryId?: string;
  tag?: string;
  search?: string;
  featured?: boolean;
  isNew?: boolean;
  sort?: "newest" | "price_asc" | "price_desc" | "name";
  limit?: number;
}

export async function getProducts(opts: ProductQuery = {}): Promise<Product[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];

  let query = supabase.from("products").select(PRODUCT_SELECT).eq("is_active", true);

  if (opts.categoryId) query = query.eq("category_id", opts.categoryId);
  if (opts.featured) query = query.eq("is_featured", true);
  if (opts.isNew) query = query.eq("is_new", true);
  if (opts.tag) query = query.contains("tags", [opts.tag]);
  if (opts.search) {
    const q = opts.search.replace(/[%,()]/g, " ").trim();
    if (q) query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
  }

  switch (opts.sort) {
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    case "name":
      query = query.order("name", { ascending: true });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  if (opts.limit) query = query.limit(opts.limit);

  const { data, error } = await query;
  if (error) {
    console.error("getProducts error:", error.message);
    return [];
  }
  return (data as unknown as RawProduct[]).map(mapProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = createPublicClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (error || !data) return null;
  return mapProduct(data as unknown as RawProduct);
}

export async function getFeaturedProducts(limit = 3): Promise<Product[]> {
  const featured = await getProducts({ featured: true, limit });
  if (featured.length > 0) return featured;
  // Fall back to newest products so the homepage is never empty.
  return getProducts({ limit });
}

export async function getRelatedProducts(
  product: Product,
  limit = 4,
): Promise<Product[]> {
  const pool = product.category
    ? await getProducts({ categoryId: undefined, limit: limit + 4 })
    : await getProducts({ limit: limit + 4 });
  return pool.filter((p) => p.id !== product.id).slice(0, limit);
}

export async function getCategories(): Promise<Category[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error || !data) return [];
  return data.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    sortOrder: c.sort_order,
  }));
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = createPublicClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, sort_order")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    description: data.description,
    sortOrder: data.sort_order,
  };
}

/** All active product slugs, for generateStaticParams + sitemap. */
export async function getAllProductSlugs(): Promise<string[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("products")
    .select("slug")
    .eq("is_active", true);
  if (error || !data) return [];
  return data.map((p) => p.slug);
}

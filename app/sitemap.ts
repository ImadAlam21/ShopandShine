import type { MetadataRoute } from "next";
import { getAllProductSlugs, getCategories } from "@/lib/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const now = new Date();

  const staticPaths = [
    "",
    "/collections",
    "/bespoke",
    "/story",
    "/contact",
    "/shipping",
    "/care",
    "/privacy",
    "/repair",
    "/appointment",
  ];

  const [productSlugs, categories] = await Promise.all([
    getAllProductSlugs(),
    getCategories(),
  ]);

  return [
    ...staticPaths.map((p) => ({
      url: `${base}${p}`,
      lastModified: now,
    })),
    ...categories.map((c) => ({
      url: `${base}/collections/${c.slug}`,
      lastModified: now,
    })),
    ...productSlugs.map((slug) => ({
      url: `${base}/products/${slug}`,
      lastModified: now,
    })),
  ];
}

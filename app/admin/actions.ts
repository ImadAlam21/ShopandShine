"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";
import { PRODUCT_BUCKET } from "@/lib/constants";
import type { OrderStatus } from "@/lib/types";

function revalidateStore(slug?: string) {
  revalidatePath("/");
  revalidatePath("/collections");
  if (slug) revalidatePath(`/products/${slug}`);
}

// ----------------------------- Products -----------------------------

function parseProduct(fd: FormData) {
  const name = String(fd.get("name") ?? "").trim();
  const slug = slugify(String(fd.get("slug") ?? "") || name);
  const priceRaw = Number(fd.get("price") ?? 0);
  const compareRaw = fd.get("compareAtPrice");
  return {
    name,
    slug,
    price: Number.isFinite(priceRaw) ? priceRaw : 0,
    compare_at_price:
      compareRaw && Number(compareRaw) > 0 ? Number(compareRaw) : null,
    stock: Math.max(0, Math.floor(Number(fd.get("stock") ?? 0)) || 0),
    sku: String(fd.get("sku") ?? "").trim() || null,
    category_id: String(fd.get("category_id") ?? "") || null,
    description: String(fd.get("description") ?? "").trim() || null,
    tags: fd.getAll("tags").map(String).filter(Boolean),
    is_active: fd.get("is_active") === "on",
    is_featured: fd.get("is_featured") === "on",
    is_new: fd.get("is_new") === "on",
  };
}

export async function createProduct(fd: FormData) {
  await requireAdmin();
  const admin = createAdminClient();
  const data = parseProduct(fd);
  if (!data.name) throw new Error("Name is required");

  const { data: created, error } = await admin
    .from("products")
    .insert(data)
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  revalidatePath("/admin/products");
  revalidateStore(data.slug);
  redirect(`/admin/products/${created.id}`);
}

export async function updateProduct(id: string, fd: FormData) {
  await requireAdmin();
  const admin = createAdminClient();
  const data = parseProduct(fd);

  const { error } = await admin.from("products").update(data).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  revalidateStore(data.slug);
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  const admin = createAdminClient();

  // Best-effort: remove the product's image folder from storage.
  const { data: files } = await admin.storage
    .from(PRODUCT_BUCKET)
    .list(`products/${id}`);
  if (files && files.length) {
    await admin.storage
      .from(PRODUCT_BUCKET)
      .remove(files.map((f) => `products/${id}/${f.name}`));
  }

  await admin.from("products").delete().eq("id", id); // images cascade
  revalidatePath("/admin/products");
  revalidateStore();
  redirect("/admin/products");
}

export async function setProductActive(id: string, value: boolean) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin.from("products").update({ is_active: value }).eq("id", id);
  revalidatePath("/admin/products");
  revalidateStore();
}

export async function setProductStock(id: string, stock: number) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin
    .from("products")
    .update({ stock: Math.max(0, Math.floor(stock) || 0) })
    .eq("id", id);
  revalidatePath("/admin/products");
  revalidateStore();
}

// ----------------------------- Images -----------------------------

export async function uploadProductImages(productId: string, fd: FormData) {
  await requireAdmin();
  const admin = createAdminClient();

  const files = fd
    .getAll("files")
    .filter((f): f is File => f instanceof File && f.size > 0);

  const { count } = await admin
    .from("product_images")
    .select("*", { count: "exact", head: true })
    .eq("product_id", productId);
  let position = count ?? 0;

  for (const file of files) {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `products/${productId}/${randomUUID()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: upErr } = await admin.storage
      .from(PRODUCT_BUCKET)
      .upload(path, buffer, { contentType: file.type, upsert: false });
    if (upErr) {
      console.error("image upload:", upErr.message);
      continue;
    }
    await admin.from("product_images").insert({
      product_id: productId,
      storage_path: path,
      position,
      is_primary: position === 0,
    });
    position++;
  }

  revalidatePath(`/admin/products/${productId}`);
  revalidateStore();
}

export async function setPrimaryImage(productId: string, imageId: string) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin
    .from("product_images")
    .update({ is_primary: false })
    .eq("product_id", productId);
  await admin
    .from("product_images")
    .update({ is_primary: true })
    .eq("id", imageId);
  revalidatePath(`/admin/products/${productId}`);
  revalidateStore();
}

export async function deleteProductImage(
  productId: string,
  imageId: string,
  storagePath: string,
) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin.storage.from(PRODUCT_BUCKET).remove([storagePath]);
  await admin.from("product_images").delete().eq("id", imageId);
  revalidatePath(`/admin/products/${productId}`);
  revalidateStore();
}

// ----------------------------- Categories -----------------------------

export async function createCategory(fd: FormData) {
  await requireAdmin();
  const admin = createAdminClient();
  const name = String(fd.get("name") ?? "").trim();
  if (!name) throw new Error("Name is required");
  await admin.from("categories").insert({
    name,
    slug: slugify(String(fd.get("slug") ?? "") || name),
    description: String(fd.get("description") ?? "").trim() || null,
    sort_order: Math.floor(Number(fd.get("sort_order") ?? 0)) || 0,
  });
  revalidatePath("/admin/categories");
  revalidateStore();
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin.from("categories").delete().eq("id", id);
  revalidatePath("/admin/categories");
  revalidateStore();
}

// ----------------------------- Orders -----------------------------

export async function updateOrderStatus(id: string, status: OrderStatus) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin.from("orders").update({ status }).eq("id", id);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}

// ----------------------------- Inquiries -----------------------------

export async function setContactRead(id: string, value: boolean) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin.from("contact_messages").update({ is_read: value }).eq("id", id);
  revalidatePath("/admin/inquiries/contact");
}

export async function updateBespokeStatus(id: string, status: string) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin.from("bespoke_inquiries").update({ status }).eq("id", id);
  revalidatePath("/admin/inquiries/bespoke");
}

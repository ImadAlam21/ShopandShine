"use client";

import { COLLECTION_TAGS } from "@/lib/constants";
import { SubmitButton } from "./SubmitButton";
import type { Category } from "@/lib/types";

export interface ProductFormValues {
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  sku: string | null;
  categoryId: string | null;
  description: string | null;
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
}

const labelCls = "block text-xs uppercase tracking-widest font-bold text-ink/40 mb-2";

export function ProductForm({
  action,
  categories,
  product,
}: {
  action: (formData: FormData) => void | Promise<void>;
  categories: Category[];
  product?: ProductFormValues;
}) {
  return (
    <form
      action={action}
      className="space-y-6 bg-white p-6 sm:p-8 rounded-2xl border border-rose-light"
    >
      <div>
        <label className={labelCls}>Product name *</label>
        <input
          name="name"
          required
          defaultValue={product?.name}
          className="field"
          placeholder="Diamond Solitaire Ring"
        />
      </div>

      <div>
        <label className={labelCls}>URL slug</label>
        <input
          name="slug"
          defaultValue={product?.slug}
          className="field"
          placeholder="leave blank to auto-generate"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={labelCls}>Price (₹) *</label>
          <input
            name="price"
            type="number"
            min={0}
            step="1"
            required
            defaultValue={product?.price}
            className="field"
          />
        </div>
        <div>
          <label className={labelCls}>Compare-at price (₹)</label>
          <input
            name="compareAtPrice"
            type="number"
            min={0}
            step="1"
            defaultValue={product?.compareAtPrice ?? ""}
            className="field"
            placeholder="optional — shows a strikethrough"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={labelCls}>Stock</label>
          <input
            name="stock"
            type="number"
            min={0}
            defaultValue={product?.stock ?? 0}
            className="field"
          />
        </div>
        <div>
          <label className={labelCls}>SKU</label>
          <input
            name="sku"
            defaultValue={product?.sku ?? ""}
            className="field"
            placeholder="optional"
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Category</label>
        <select
          name="category_id"
          defaultValue={product?.categoryId ?? ""}
          className="field"
        >
          <option value="">— None —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelCls}>Description</label>
        <textarea
          name="description"
          rows={4}
          defaultValue={product?.description ?? ""}
          className="field"
        />
      </div>

      <div>
        <label className={labelCls}>Collections (tags)</label>
        <div className="flex flex-wrap gap-4">
          {COLLECTION_TAGS.map((tag) => (
            <label key={tag} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="tags"
                value={tag}
                defaultChecked={product?.tags?.includes(tag)}
                className="accent-rose w-4 h-4"
              />
              {tag}
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-6 pt-2 border-t border-rose-light">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={product ? product.isActive : true}
            className="accent-rose w-4 h-4"
          />
          Active (visible on store)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="is_featured"
            defaultChecked={product?.isFeatured}
            className="accent-rose w-4 h-4"
          />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="is_new"
            defaultChecked={product?.isNew}
            className="accent-rose w-4 h-4"
          />
          New arrival
        </label>
      </div>

      <SubmitButton label={product ? "Save changes" : "Create product"} />
    </form>
  );
}

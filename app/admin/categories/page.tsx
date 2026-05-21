import { createAdminClient } from "@/lib/supabase/admin";
import { createCategory } from "@/app/admin/actions";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { DeleteCategoryButton } from "@/components/admin/AdminInline";

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
}

export default async function AdminCategoriesPage() {
  let categories: CategoryRow[] = [];
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("categories")
      .select("id, name, slug, sort_order, is_active")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    categories = (data as CategoryRow[]) ?? [];
  } catch {
    categories = [];
  }

  return (
    <div>
      <h1 className="text-3xl font-serif mb-8">Categories</h1>

      <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">
        <div className="bg-white rounded-2xl border border-rose-light overflow-hidden">
          {categories.length === 0 ? (
            <p className="p-8 text-center text-ink/40">No categories yet.</p>
          ) : (
            <ul>
              {categories.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between p-4 border-b border-rose-light/60 last:border-0"
                >
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-ink/40">/{c.slug}</p>
                  </div>
                  <DeleteCategoryButton id={c.id} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <form
          action={createCategory}
          className="bg-white rounded-2xl border border-rose-light p-6 space-y-4"
        >
          <h2 className="text-lg font-serif">Add category</h2>
          <input name="name" required placeholder="Name" className="field" />
          <input
            name="slug"
            placeholder="Slug (optional)"
            className="field"
          />
          <input
            name="sort_order"
            type="number"
            placeholder="Sort order (0)"
            className="field"
          />
          <SubmitButton label="Add category" className="rose-button w-full" />
        </form>
      </div>
    </div>
  );
}

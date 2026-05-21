import Link from "next/link";
import { getCategories } from "@/lib/queries";
import { ProductForm } from "@/components/admin/ProductForm";
import { createProduct } from "@/app/admin/actions";

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div>
      <Link
        href="/admin/products"
        className="text-sm text-ink/50 hover:text-rose"
      >
        ← Back to products
      </Link>
      <h1 className="text-3xl font-serif mt-2 mb-2">Add product</h1>
      <p className="text-ink/50 mb-8">
        Create the product first, then add photos on the next screen.
      </p>
      <ProductForm action={createProduct} categories={categories} />
    </div>
  );
}

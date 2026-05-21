import Image from "next/image";
import Link from "next/link";
import { formatINR } from "@/lib/format";
import { AddToCartButton } from "./AddToCartButton";
import { WishlistButton } from "./WishlistButton";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const onSale =
    product.compareAtPrice != null && product.compareAtPrice > product.price;
  const out = product.stock <= 0;
  const href = `/products/${product.slug}`;

  return (
    <div className="group">
      <div className="relative overflow-hidden rounded-3xl aspect-[4/5] mb-5 bg-rose-light">
        <Link href={href} className="block w-full h-full">
          <Image
            src={product.primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </Link>

        <WishlistButton id={product.id} className="absolute top-4 right-4" />

        <AddToCartButton
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

        {out ? (
          <span className="absolute top-4 left-4 bg-ink text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
            Sold out
          </span>
        ) : product.isNew ? (
          <span className="absolute top-4 left-4 bg-rose-soft text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
            New
          </span>
        ) : onSale ? (
          <span className="absolute top-4 left-4 bg-rose text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
            Sale
          </span>
        ) : null}
      </div>

      <div className="flex justify-between items-start gap-2">
        <div>
          {product.category && (
            <span className="text-[10px] uppercase tracking-widest text-ink/40 font-bold">
              {product.category.name}
            </span>
          )}
          <h4 className="text-lg font-serif mt-0.5 leading-tight">
            <Link href={href} className="hover:text-rose transition-colors">
              {product.name}
            </Link>
          </h4>
        </div>
        <div className="text-right shrink-0">
          <span className="font-medium text-rose">
            {formatINR(product.price)}
          </span>
          {onSale && (
            <span className="block text-xs text-ink/30 line-through">
              {formatINR(product.compareAtPrice!)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

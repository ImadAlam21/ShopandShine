"use client";

import { useState } from "react";
import Image from "next/image";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/lib/types";

export function ProductGallery({
  images,
  name,
}: {
  images: ProductImage[];
  name: string;
}) {
  const imgs =
    images.length > 0
      ? images
      : [{ url: PLACEHOLDER_IMAGE, alt: name, isPrimary: true, position: 0 }];
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-rose-light">
        <Image
          src={imgs[active].url}
          alt={imgs[active].alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
      {imgs.length > 1 && (
        <div className="flex gap-3 mt-4 flex-wrap">
          {imgs.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                "relative w-20 h-24 rounded-2xl overflow-hidden border-2 transition-colors",
                i === active ? "border-rose" : "border-transparent",
              )}
              aria-label={`View image ${i + 1}`}
            >
              <Image
                src={img.url}
                alt={img.alt}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

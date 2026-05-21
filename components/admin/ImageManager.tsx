"use client";

import Image from "next/image";
import { Star, Trash2 } from "lucide-react";
import {
  uploadProductImages,
  setPrimaryImage,
  deleteProductImage,
} from "@/app/admin/actions";
import { SubmitButton } from "./SubmitButton";

export interface AdminImage {
  id: string;
  url: string;
  storagePath: string;
  isPrimary: boolean;
}

export function ImageManager({
  productId,
  images,
}: {
  productId: string;
  images: AdminImage[];
}) {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-rose-light">
      <h2 className="text-lg font-serif mb-1">Images</h2>
      <p className="text-sm text-ink/50 mb-6">
        The starred image is the main one shown in listings.
      </p>

      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {images.map((img) => (
            <div
              key={img.id}
              className="relative group rounded-2xl overflow-hidden border border-rose-light"
            >
              <div className="relative aspect-square bg-rose-light">
                <Image
                  src={img.url}
                  alt=""
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              </div>
              {img.isPrimary && (
                <span className="absolute top-2 left-2 bg-rose text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" /> Main
                </span>
              )}
              <div className="absolute bottom-0 inset-x-0 flex">
                {!img.isPrimary && (
                  <form
                    action={setPrimaryImage.bind(null, productId, img.id)}
                    className="flex-1"
                  >
                    <button
                      type="submit"
                      className="w-full bg-white/90 text-[11px] font-medium py-1.5 hover:bg-rose hover:text-white transition-colors"
                    >
                      Make main
                    </button>
                  </form>
                )}
                <form
                  action={deleteProductImage.bind(
                    null,
                    productId,
                    img.id,
                    img.storagePath,
                  )}
                >
                  <button
                    type="submit"
                    className="bg-white/90 text-ink/60 px-3 py-1.5 hover:bg-rose hover:text-white transition-colors"
                    aria-label="Delete image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-ink/40 mb-8">No images yet.</p>
      )}

      <form
        action={uploadProductImages.bind(null, productId)}
        className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-t border-rose-light pt-6"
      >
        <input
          type="file"
          name="files"
          multiple
          accept="image/*"
          required
          className="text-sm file:mr-4 file:rounded-full file:border-0 file:bg-rose-light file:text-rose file:px-4 file:py-2 file:font-medium"
        />
        <SubmitButton label="Upload images" pendingLabel="Uploading…" />
      </form>
    </div>
  );
}

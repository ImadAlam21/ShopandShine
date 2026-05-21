import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "Crafting timeless elegance — the story behind Shop & Shine jewellery.",
};

export default function StoryPage() {
  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div>
          <span className="uppercase tracking-[0.3em] text-xs font-bold text-rose mb-4 block">
            Our Story
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif mb-8 leading-tight">
            Crafting Timeless Elegance
          </h1>
          <p className="text-ink/70 leading-relaxed mb-6">
            Shop &amp; Shine was founded on the belief that jewellery should be
            more than an accessory — it should be a celebration of life&apos;s
            most precious moments.
          </p>
          <p className="text-ink/70 leading-relaxed">
            Every piece in our collection is meticulously handcrafted, blending
            traditional techniques with contemporary design to create jewellery
            that lasts for generations.
          </p>
        </div>
        <div className="relative">
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
            <Image
              src="https://picsum.photos/seed/ss-story/800/1000"
              alt="Our workshop"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-8 -left-4 sm:-left-8 bg-rose text-white p-8 rounded-3xl hidden sm:block">
            <p className="text-4xl font-serif font-bold">10+</p>
            <p className="text-xs uppercase tracking-widest mt-2">
              Years of Excellence
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

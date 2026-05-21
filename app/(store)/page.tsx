import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getFeaturedProducts } from "@/lib/queries";
import { ProductGrid } from "@/components/product/ProductGrid";

export const revalidate = 3600;

export default async function HomePage() {
  const featured = await getFeaturedProducts(4);

  return (
    <>
      {/* Hero */}
      <section className="relative h-screen min-h-[560px] flex items-center overflow-hidden">
        <Image
          src="/hero.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover brightness-[0.6]"
        />
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-2xl text-white">
            <span className="uppercase tracking-[0.3em] text-sm font-semibold text-rose-soft mb-4 block">
              New Collection 2026
            </span>
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-serif leading-none mb-8">
              Elegance <br />
              <span className="italic font-light">Redefined.</span>
            </h1>
            <p className="text-lg text-white/80 mb-10 max-w-md leading-relaxed">
              Discover our latest collection of handcrafted jewellery, where
              every piece tells a story of timeless beauty.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/collections" className="rose-button">
                Shop Now
              </Link>
              <Link
                href="/collections?sort=newest"
                className="px-8 py-3 rounded-full border border-white text-white font-medium hover:bg-white hover:text-ink transition-all"
              >
                New Arrivals
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="uppercase tracking-[0.3em] text-xs font-bold text-rose mb-3 block">
                Curated Selection
              </span>
              <h2 className="text-4xl sm:text-5xl font-serif">Featured Pieces</h2>
            </div>
            <Link
              href="/collections"
              className="text-sm font-bold uppercase tracking-widest border-b-2 border-rose pb-2 hover:text-rose transition-colors hidden sm:inline-flex items-center gap-2"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <ProductGrid
            products={featured}
            emptyMessage="New pieces are arriving soon. ✦"
          />
        </div>
      </section>

      {/* Bespoke banner */}
      <section className="py-24 sm:py-32 bg-blush overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative">
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/bespoke.jpg"
                  alt="Bespoke jewellery design"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-8 -right-4 sm:-right-8 bg-white p-8 rounded-3xl shadow-xl hidden sm:block max-w-[240px]">
                <p className="text-rose font-serif text-2xl italic mb-2">
                  &ldquo;True luxury is personal.&rdquo;
                </p>
                <p className="text-xs uppercase tracking-widest font-bold text-ink/40">
                  — Imad Alam
                </p>
              </div>
            </div>
            <div>
              <span className="uppercase tracking-[0.3em] text-xs font-bold text-rose mb-4 block">
                Custom Creations
              </span>
              <h2 className="text-4xl sm:text-5xl font-serif mb-8">
                The Bespoke Experience
              </h2>
              <p className="text-ink/70 text-lg leading-relaxed mb-10">
                Create a piece as unique as your story. Our master craftsmen
                work closely with you to bring your vision to life, using only
                the finest ethically sourced materials.
              </p>
              <Link href="/bespoke" className="rose-button">
                Start Your Journey
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

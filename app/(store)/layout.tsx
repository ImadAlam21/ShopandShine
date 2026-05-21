import Script from "next/script";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Newsletter } from "@/components/layout/Newsletter";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { getCategories } from "@/lib/queries";
import { STORE_NAME, STORE_TAGLINE } from "@/lib/constants";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await getCategories();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: STORE_NAME,
    description: STORE_TAGLINE,
    url: siteUrl,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <Header categories={categories} />
      <main className="min-h-screen">{children}</main>
      <Newsletter />
      <Footer categories={categories} />
      <CartDrawer />
      {/* Razorpay Checkout — loaded once for the whole storefront. */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
    </>
  );
}

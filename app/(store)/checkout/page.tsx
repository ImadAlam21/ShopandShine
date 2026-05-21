import type { Metadata } from "next";
import { getProfile } from "@/lib/auth";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

export default async function CheckoutPage() {
  // Guest checkout allowed; prefill if the user happens to be logged in.
  const profile = await getProfile().catch(() => null);

  return (
    <div className="pt-28 sm:pt-32 pb-24 max-w-6xl mx-auto px-6">
      <h1 className="text-4xl sm:text-5xl font-serif mb-10">Checkout</h1>
      <CheckoutForm
        defaultEmail={profile?.email ?? ""}
        defaultName={profile?.full_name ?? ""}
      />
    </div>
  );
}

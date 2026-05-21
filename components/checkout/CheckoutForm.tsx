"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart, selectTotal } from "@/components/cart/cart-store";
import { useHydrated } from "@/components/hooks/use-hydrated";
import { formatINR } from "@/lib/format";
import { STORE_NAME } from "@/lib/constants";

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

interface RazorpaySuccess {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export function CheckoutForm({
  defaultEmail = "",
  defaultName = "",
}: {
  defaultEmail?: string;
  defaultName?: string;
}) {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const hydrated = useHydrated();
  const total = hydrated ? selectTotal(items) : 0;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (hydrated && items.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-ink/50 text-xl mb-4">Your bag is empty.</p>
        <Link
          href="/collections"
          className="text-rose font-bold uppercase tracking-widest text-sm"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);

    const payload = {
      items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
      email: fd.get("email"),
      phone: fd.get("phone"),
      shippingName: fd.get("name"),
      shippingAddress: {
        line1: fd.get("line1"),
        line2: fd.get("line2"),
        city: fd.get("city"),
        state: fd.get("state"),
        pincode: fd.get("pincode"),
        country: fd.get("country") || "India",
      },
    };

    try {
      const res = await fetch("/api/payment/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not start checkout.");
        setSubmitting(false);
        return;
      }

      const ready = await loadRazorpay();
      if (!ready || !window.Razorpay) {
        setError("Could not load the payment gateway. Please try again.");
        setSubmitting(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: data.key,
        amount: data.amountPaise,
        currency: data.currency,
        name: STORE_NAME,
        description: "Jewellery purchase",
        order_id: data.razorpayOrderId,
        prefill: data.prefill,
        theme: { color: "#C2185B" },
        handler: async (resp: RazorpaySuccess) => {
          const vr = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature,
            }),
          });
          const vd = await vr.json();
          if (vr.ok) {
            clear();
            router.push(`/order/${vd.orderNumber}`);
          } else {
            setError(
              "Payment could not be verified. If you were charged, please contact us.",
            );
            setSubmitting(false);
          }
        },
        modal: { ondismiss: () => setSubmitting(false) },
      });
      rzp.open();
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12">
      <form onSubmit={onSubmit} className="space-y-6">
        <h2 className="text-xl font-serif">Contact</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          <input
            name="email"
            type="email"
            required
            defaultValue={defaultEmail}
            placeholder="Email"
            className="field"
          />
          <input name="phone" placeholder="Phone" className="field" />
        </div>

        <h2 className="text-xl font-serif pt-4">Shipping</h2>
        <input
          name="name"
          required
          defaultValue={defaultName}
          placeholder="Full name"
          className="field"
        />
        <input name="line1" required placeholder="Address line 1" className="field" />
        <input name="line2" placeholder="Address line 2 (optional)" className="field" />
        <div className="grid sm:grid-cols-2 gap-5">
          <input name="city" required placeholder="City" className="field" />
          <input name="state" required placeholder="State" className="field" />
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          <input name="pincode" required placeholder="PIN code" className="field" />
          <input
            name="country"
            defaultValue="India"
            placeholder="Country"
            className="field"
          />
        </div>

        {error && <p className="text-rose text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rose-button w-full py-4 text-sm uppercase tracking-widest"
        >
          {submitting ? "Processing…" : `Pay ${formatINR(total)}`}
        </button>
        <p className="text-[11px] text-center text-ink/40 uppercase tracking-widest">
          Secure checkout · powered by Razorpay
        </p>
      </form>

      <aside className="bg-blush rounded-3xl p-6 h-fit">
        <h2 className="text-xl font-serif mb-6">Order Summary</h2>
        <div className="space-y-4 mb-6">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3 items-center">
              <div className="relative w-14 h-16 rounded-xl overflow-hidden bg-rose-light shrink-0">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-xs text-ink/40">Qty {item.quantity}</p>
              </div>
              <p className="text-sm font-medium">
                {formatINR(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>
        <div className="border-t border-rose-light pt-4 space-y-2">
          <div className="flex justify-between text-sm text-ink/60">
            <span>Subtotal</span>
            <span>{formatINR(total)}</span>
          </div>
          <div className="flex justify-between text-sm text-ink/60">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="flex justify-between text-lg font-serif font-bold pt-2">
            <span>Total</span>
            <span>{formatINR(total)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}

import "server-only";
import Razorpay from "razorpay";

/** Server-side Razorpay client. Throws if keys aren't configured. */
export function getRazorpay() {
  const key_id =
    process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    throw new Error("Razorpay keys are not configured.");
  }
  return new Razorpay({ key_id, key_secret });
}

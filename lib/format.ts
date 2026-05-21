// Money helpers. Prices are stored in the DB as rupees (numeric).
// Razorpay works in paise (1 rupee = 100 paise) — convert only at the payment boundary.

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** Format rupees for display, e.g. 45000 -> "₹45,000". */
export function formatINR(rupees: number): string {
  return inrFormatter.format(rupees);
}

/** Convert rupees to paise for Razorpay. */
export function toPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/** Convert paise (as stored on orders) back to rupees. */
export function fromPaise(paise: number): number {
  return paise / 100;
}

/** Format a paise amount for display, e.g. 4500000 -> "₹45,000". */
export function formatPaise(paise: number): string {
  return formatINR(fromPaise(paise));
}

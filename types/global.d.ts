export {};

// Razorpay Checkout is loaded via <Script> (see app/layout.tsx) and attaches
// itself to window. This gives us a minimal typed surface for it.
interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: unknown) => void) => void;
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

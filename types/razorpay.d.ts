// Minimal type surface for the Razorpay Node SDK (it ships no types we rely on).
declare module "razorpay" {
  interface RazorpayOrder {
    id: string;
    amount: number;
    currency: string;
    receipt?: string;
    status: string;
  }
  interface Orders {
    create(options: {
      amount: number;
      currency: string;
      receipt?: string;
      notes?: Record<string, string>;
    }): Promise<RazorpayOrder>;
  }
  export default class Razorpay {
    constructor(options: { key_id: string; key_secret: string });
    orders: Orders;
  }
}

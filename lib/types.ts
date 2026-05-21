// Normalized, UI-friendly types used across the app. These are mapped from the
// raw Supabase rows in lib/queries.ts so components never deal with DB shapes.

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
}

export interface ProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
  position: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number; // rupees
  compareAtPrice: number | null;
  stock: number;
  sku: string | null;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  tags: string[];
  category: { name: string; slug: string } | null;
  images: ProductImage[];
  /** Resolved URL of the primary image (or a placeholder). */
  primaryImage: string;
  createdAt: string;
}

export type OrderStatus =
  | "pending"
  | "paid"
  | "failed"
  | "fulfilled"
  | "cancelled"
  | "refunded";

export interface OrderItem {
  id: string;
  productId: string | null;
  productName: string;
  unitPricePaise: number;
  quantity: number;
  lineTotalPaise: number;
}

export interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  profileId: string | null;
  email: string;
  phone: string | null;
  shippingName: string | null;
  shippingAddress: ShippingAddress | null;
  subtotalPaise: number;
  shippingPaise: number;
  totalPaise: number;
  currency: string;
  status: OrderStatus;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  notes: string | null;
  createdAt: string;
  items?: OrderItem[];
}

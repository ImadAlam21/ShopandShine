// Central place for app-wide constants.

export const STORE_NAME = "Shop & Shine";
export const STORE_TAGLINE = "Handcrafted jewellery for life's precious moments.";

// Supabase Storage bucket that holds product photography.
export const PRODUCT_BUCKET = "jewelry-assets";

// Curated collections surfaced in the menu/footer. These map to product `tags`,
// not the physical `category` (e.g. a Ring can also be "Bridal").
export const COLLECTION_TAGS = ["Bridal", "Minimalist", "Heritage"] as const;

// Default categories used to seed a brand-new store.
export const DEFAULT_CATEGORIES = [
  "Rings",
  "Necklaces",
  "Earrings",
  "Bracelets",
  "Pendants",
] as const;

// A neutral placeholder shown when a product has no uploaded image yet.
export const PLACEHOLDER_IMAGE = "/placeholder-product.svg";

export const CURRENCY = "INR";

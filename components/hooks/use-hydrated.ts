"use client";

import { useEffect, useState } from "react";

/**
 * Returns false during SSR and the first client render, true thereafter.
 * Use it to gate persisted (localStorage) UI like the cart badge so server and
 * client markup match and we avoid hydration warnings.
 */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}

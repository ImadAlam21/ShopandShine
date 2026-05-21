"use client";

import { useRouter } from "next/navigation";

const OPTIONS: { value: string; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name", label: "Name: A–Z" },
];

export function SortSelect({
  sort,
  params,
  basePath = "/collections",
}: {
  sort: string;
  params: Record<string, string>;
  basePath?: string;
}) {
  const router = useRouter();

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = new URLSearchParams(params);
    if (e.target.value === "newest") next.delete("sort");
    else next.set("sort", e.target.value);
    const qs = next.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  };

  return (
    <select
      value={sort}
      onChange={onChange}
      aria-label="Sort products"
      className="border border-rose-light rounded-full px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose/40"
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

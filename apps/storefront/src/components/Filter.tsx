"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ReactElement, Suspense } from "react";

// Inner component that uses useSearchParams (must be inside Suspense for Next.js 15 static prerendering)
const FilterContent : () => ReactElement = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const handleFilter = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort", value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex items-center justify-end gap-2 text-sm text-gray-500 my-6">
      <span>Sort by:</span>
      <select
        name="sort"
        id="sort"
        className="ring-1 ring-gray-200 shadow-md p-1 rounded-sm"
        onChange={(e) => handleFilter(e.target.value)}
      >
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="asc">Price: Low to High</option>
        <option value="desc">Price: High to Low</option>
      </select>
    </div>
  );
};

// Wrapped in Suspense because useSearchParams() requires it during Next.js 15 static prerendering
const Filter = (): ReactElement => (
  <Suspense fallback={<div className="flex items-center justify-end gap-2 text-sm text-gray-400 my-6">Sort by: ...</div>}>
    <FilterContent />
  </Suspense>
);

export default Filter;
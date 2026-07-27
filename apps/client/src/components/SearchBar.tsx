"use client";

import { Search, Loader2, X, ArrowRight, Package } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ProductType } from "@repo/types";

const SearchBar = (): JSX.Element => {
  const [value, setValue] = useState("");
  const [results, setResults] = useState<ProductType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync initial search value from URL search param if present
  useEffect(() => {
    const query = searchParams.get("search");
    if (query) {
      setValue(query);
    }
  }, [searchParams]);

  // Real-time search effect with debounce
  useEffect(() => {
    const query = value.trim();

    if (!query) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL || "http://localhost:8000";
        const res = await fetch(
          `${baseUrl}/products?search=${encodeURIComponent(query)}&limit=6`
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setResults(data);
          } else {
            setResults([]);
          }
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error("Realtime search error:", err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (searchTerm: string) => {
    const term = searchTerm.trim();
    if (!term) return;
    setIsOpen(false);
    const params = new URLSearchParams(searchParams.toString());
    params.set("search", term);
    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  const handleClear = () => {
    setValue("");
    setResults([]);
    setIsOpen(false);
  };

  const getItemImage = (product: ProductType): string => {
    if (!product.images) return "/products/placeholder.png";
    const imagesObj = product.images as Record<string, string>;
    const firstUrl = Object.values(imagesObj)[0];
    return firstUrl || "/products/placeholder.png";
  };

  return (
    <div
      ref={containerRef}
      className="relative flex flex-1 max-w-xl z-50 w-full"
    >
      {/* SEARCH BAR CONTAINER */}
      <div className="flex w-full items-center gap-2 rounded-full ring-1 ring-gray-200/80 focus-within:ring-2 focus-within:ring-brand/80 pl-3 pr-1 py-1 shadow-xs bg-white transition-all">
        <input
          id="search"
          type="text"
          value={value}
          placeholder="Search products, categories..."
          className="text-sm outline-hidden pl-1 w-full min-w-0 text-gray-700 placeholder-gray-400 bg-transparent py-1.5"
          onChange={(e) => {
            setValue(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearchSubmit(value);
            } else if (e.key === "Escape") {
              setIsOpen(false);
            }
          }}
        />

        {/* Clear Button */}
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Search Submit Button */}
        <button
          type="button"
          onClick={() => handleSearchSubmit(value)}
          className="cursor-pointer bg-brand hover:bg-brand-hover rounded-full w-9 h-9 flex shrink-0 items-center justify-center transition-colors shadow-xs"
          title="Search"
        >
          <Search className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* REAL-TIME DROPDOWN RESULTS */}
      {isOpen && value.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden animate-in fade-in-50 slide-in-from-top-2 duration-150 z-50">
          {/* Header indicator */}
          <div className="px-4 py-2.5 bg-surface border-b border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>
              {isLoading ? "Searching catalog..." : `Results for "${value.trim()}"`}
            </span>
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-brand" />}
          </div>

          {/* Results List */}
          {!isLoading && results.length > 0 && (
            <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-50 py-1">
              {results.map((product) => {
                const imageUrl = getItemImage(product);
                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3.5 px-4 py-3 hover:bg-gray-50 transition-colors group"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-12 h-12 rounded-xl bg-surface border border-gray-100 overflow-hidden shrink-0">
                      <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        sizes="48px"
                        className="object-contain p-1 group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>

                    {/* Product Metadata */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-800 group-hover:text-brand truncate transition-colors">
                        {product.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100/50 uppercase tracking-wider">
                          {product.categorySlug}
                        </span>
                        {product.shortDescription && (
                          <span className="text-xs text-gray-400 truncate max-w-[180px]">
                            {product.shortDescription}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold text-gray-900">
                        ${product.price.toFixed(2)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && results.length === 0 && (
            <div className="p-8 text-center flex flex-col items-center justify-center">
              <Package className="w-8 h-8 text-gray-300 mb-2" />
              <p className="text-sm font-semibold text-gray-700">No products found</p>
              <p className="text-xs text-gray-400 mt-1 max-w-xs">
                We couldn&apos;t find any items matching &quot;{value}&quot;. Try searching for something else.
              </p>
            </div>
          )}

          {/* Footer Action: View All Results */}
          <button
            type="button"
            onClick={() => handleSearchSubmit(value)}
            className="w-full px-4 py-3 bg-surface hover:bg-gray-100 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-brand transition-colors"
          >
            <span>View all matching products</span>
            <div className="flex items-center gap-1">
              <span>Press Enter</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
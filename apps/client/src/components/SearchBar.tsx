"use client";

import { Search, Loader2, X, ArrowRight, Package, ArrowLeft } from "lucide-react";
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
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

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
        setIsMobileExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (searchTerm: string) => {
    const term = searchTerm.trim();
    if (!term) return;
    setIsOpen(false);
    setIsMobileExpanded(false);
    const params = new URLSearchParams(searchParams.toString());
    params.set("search", term);
    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  const handleClear = () => {
    setValue("");
    setResults([]);
  };

  const closeSearch = () => {
    setIsOpen(false);
    setIsMobileExpanded(false);
  };

  const getItemImage = (product: ProductType): string => {
    if (!product.images) return "/products/placeholder.png";
    const imagesObj = product.images as Record<string, string>;
    const firstUrl = Object.values(imagesObj)[0];
    return firstUrl || "/products/placeholder.png";
  };

  return (
    <div ref={containerRef} className="relative flex flex-1 max-w-xl z-50">

      {/* ── EXPANDED MOBILE OVERLAY ── */}
      {isMobileExpanded && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 md:hidden animate-in fade-in-0 duration-150">
          <div className="bg-white p-3 shadow-xl border-b border-gray-100 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2">
              {/* Back button */}
              <button
                type="button"
                onClick={closeSearch}
                className="p-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors shrink-0"
                title="Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              {/* Full-width Search Input */}
              <div className="flex flex-1 items-center gap-2 rounded-full ring-1 ring-gray-200/90 focus-within:ring-2 focus-within:ring-brand pl-3 pr-1 py-1 shadow-xs bg-white">
                <input
                  ref={mobileInputRef}
                  type="text"
                  value={value}
                  placeholder="Search products..."
                  autoFocus
                  className="text-sm outline-hidden pl-1 w-full min-w-0 text-gray-800 placeholder-gray-400 bg-transparent py-1.5"
                  onChange={(e) => {
                    setValue(e.target.value);
                    setIsOpen(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearchSubmit(value);
                    } else if (e.key === "Escape") {
                      closeSearch();
                    }
                  }}
                />

                {value && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleSearchSubmit(value)}
                  className="bg-brand hover:bg-brand-hover rounded-full w-9 h-9 flex shrink-0 items-center justify-center text-white shadow-xs"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mobile Real-time Results */}
            {value.trim().length > 0 && (
              <div className="mt-3 bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden max-h-[70vh] overflow-y-auto divide-y divide-gray-50">
                <div className="px-4 py-2 bg-surface flex items-center justify-between text-xs text-gray-500 font-medium">
                  <span>
                    {isLoading ? "Searching catalog..." : `Results for "${value.trim()}"`}
                  </span>
                  {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-brand" />}
                </div>

                {!isLoading && results.length > 0 && (
                  <div className="divide-y divide-gray-50">
                    {results.map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.id}`}
                        onClick={closeSearch}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="relative w-11 h-11 rounded-xl bg-surface border border-gray-100 overflow-hidden shrink-0">
                          <Image
                            src={getItemImage(product)}
                            alt={product.name}
                            fill
                            sizes="44px"
                            className="object-contain p-1"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-800 truncate">
                            {product.name}
                          </h4>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 uppercase">
                            {product.categorySlug}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-gray-900 shrink-0">
                          ${product.price.toFixed(2)}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}

                {!isLoading && results.length === 0 && (
                  <div className="p-6 text-center">
                    <Package className="w-7 h-7 text-gray-300 mx-auto mb-1" />
                    <p className="text-xs font-semibold text-gray-700">No products found</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => handleSearchSubmit(value)}
                  className="w-full px-4 py-3 bg-surface hover:bg-gray-100 flex items-center justify-between text-xs font-semibold text-brand"
                >
                  <span>View all matching products</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── STANDARD SEARCH INPUT (DESKTOP & UNEXPANDED MOBILE) ── */}
      <div className="flex w-full items-center gap-2 rounded-full ring-1 ring-gray-200/80 focus-within:ring-2 focus-within:ring-brand/80 pl-3 pr-1 py-1 shadow-xs bg-white transition-all">
        <input
          id="search"
          type="text"
          value={value}
          placeholder="Search..."
          className="text-sm outline-hidden pl-1 w-full min-w-0 text-gray-700 placeholder-gray-400 bg-transparent py-1.5"
          onChange={(e) => {
            setValue(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            // Trigger full expansion on mobile
            if (window.innerWidth < 768) {
              setIsMobileExpanded(true);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearchSubmit(value);
            } else if (e.key === "Escape") {
              closeSearch();
            }
          }}
        />

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

        <button
          type="button"
          onClick={() => {
            if (window.innerWidth < 768 && !isMobileExpanded) {
              setIsMobileExpanded(true);
            } else {
              handleSearchSubmit(value);
            }
          }}
          className="cursor-pointer bg-brand hover:bg-brand-hover rounded-full w-9 h-9 flex shrink-0 items-center justify-center transition-colors shadow-xs"
          title="Search"
        >
          <Search className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* ── DESKTOP REAL-TIME DROPDOWN RESULTS ── */}
      {isOpen && value.trim().length > 0 && !isMobileExpanded && (
        <div className="hidden md:block absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden animate-in fade-in-50 slide-in-from-top-2 duration-150 z-50">
          <div className="px-4 py-2.5 bg-surface border-b border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>
              {isLoading ? "Searching catalog..." : `Results for "${value.trim()}"`}
            </span>
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-brand" />}
          </div>

          {!isLoading && results.length > 0 && (
            <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-50 py-1">
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  onClick={closeSearch}
                  className="flex items-center gap-3.5 px-4 py-3 hover:bg-gray-50 transition-colors group"
                >
                  <div className="relative w-12 h-12 rounded-xl bg-surface border border-gray-100 overflow-hidden shrink-0">
                    <Image
                      src={getItemImage(product)}
                      alt={product.name}
                      fill
                      sizes="48px"
                      className="object-contain p-1 group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
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
                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-gray-900">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!isLoading && results.length === 0 && (
            <div className="p-8 text-center flex flex-col items-center justify-center">
              <Package className="w-8 h-8 text-gray-300 mb-2" />
              <p className="text-sm font-semibold text-gray-700">No products found</p>
              <p className="text-xs text-gray-400 mt-1 max-w-xs">
                We couldn&apos;t find any items matching &quot;{value}&quot;. Try searching for something else.
              </p>
            </div>
          )}

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
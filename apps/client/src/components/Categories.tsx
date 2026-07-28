"use client";

import Link from "next/link";
import {
  Footprints,
  Glasses,
  Briefcase,
  Shirt,
  LayoutGrid,
  Hand,
  Sparkles,
  Layers,
  MoreHorizontal,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const allCategory = {
  name: "All",
  icon: <LayoutGrid className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.75]" />,
  slug: "all",
  bgColor: "bg-blue-50 text-blue-600 group-hover:bg-blue-100",
};

const middleCategories = [
  {
    name: "T-shirts",
    icon: <Shirt className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.75]" />,
    slug: "t-shirt",
    bgColor: "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100",
  },
  {
    name: "Shoes",
    icon: <Footprints className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.75]" />,
    slug: "shoes",
    bgColor: "bg-sky-50 text-sky-600 group-hover:bg-sky-100",
  },
  {
    name: "Accessories",
    icon: <Glasses className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.75]" />,
    slug: "accessories",
    bgColor: "bg-purple-50 text-purple-600 group-hover:bg-purple-100",
  },
  {
    name: "Bags",
    icon: <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.75]" />,
    slug: "bags",
    bgColor: "bg-amber-50 text-amber-600 group-hover:bg-amber-100",
  },
  {
    name: "Dresses",
    icon: <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.75]" />,
    slug: "dresses",
    bgColor: "bg-pink-50 text-pink-600 group-hover:bg-pink-100",
  },
  {
    name: "Jackets",
    icon: <Layers className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.75]" />,
    slug: "jackets",
    bgColor: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100",
  },
  {
    name: "Gloves",
    icon: <Hand className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.75]" />,
    slug: "gloves",
    bgColor: "bg-rose-50 text-rose-600 group-hover:bg-rose-100",
  },
];

const Categories = (): React.ReactNode => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const [maxMiddleItems, setMaxMiddleItems] = useState<number>(middleCategories.length);

  const currentCategory = searchParams.get("category");
  const selectedCategory = !currentCategory ? "all" : currentCategory;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        // Reserved space for "All" (~70px) + "More" (~70px) + padding (~32px)
        const reservedWidth = 170;
        const itemWidth = 76; // Approx width per category item including gaps
        const availableForMiddle = width - reservedWidth;
        const count = Math.max(
          0,
          Math.min(
            middleCategories.length,
            Math.floor(availableForMiddle / itemWidth)
          )
        );
        setMaxMiddleItems(count);
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleChange = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug === "all") {
      params.delete("category");
    } else {
      params.set("category", slug);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const visibleMiddle = middleCategories.slice(0, maxMiddleItems);

  return (
    <div
      ref={containerRef}
      className="w-full bg-white rounded-2xl p-3 sm:p-4 border border-gray-100 shadow-sm mb-4 overflow-hidden"
    >
      <div className="flex items-center justify-between gap-2 py-1 px-1 w-full">
        {/* ALWAYS ON LEFT: All Category */}
        <div
          onClick={() => handleChange(allCategory.slug)}
          className="flex flex-col items-center justify-center gap-1.5 cursor-pointer group shrink-0 select-none text-center min-w-[56px] sm:min-w-[64px]"
        >
          <div
            className={`
              w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center 
              transition-all duration-200 group-hover:scale-105 shrink-0
              ${allCategory.bgColor}
              ${
                selectedCategory === "all"
                  ? "ring-2 ring-blue-600 scale-105 shadow-sm"
                  : "border border-transparent"
              }
            `}
          >
            {allCategory.icon}
          </div>
          <span
            className={`text-[11px] sm:text-xs font-medium transition-colors text-center whitespace-nowrap ${
              selectedCategory === "all"
                ? "text-gray-900 font-semibold"
                : "text-gray-600 group-hover:text-gray-900"
            }`}
          >
            {allCategory.name}
          </span>
        </div>

        {/* MIDDLE ITEMS (DYNAMICALLY FITTED TO AVAILABLE SPACE) */}
        {visibleMiddle.map((category) => {
          const isSelected = selectedCategory === category.slug;

          return (
            <div
              key={category.slug}
              onClick={() => handleChange(category.slug)}
              className="flex flex-col items-center justify-center gap-1.5 cursor-pointer group shrink-0 select-none text-center min-w-[56px] sm:min-w-[64px]"
            >
              <div
                className={`
                  w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center 
                  transition-all duration-200 group-hover:scale-105 shrink-0
                  ${category.bgColor}
                  ${
                    isSelected
                      ? "ring-2 ring-blue-600 scale-105 shadow-sm"
                      : "border border-transparent"
                  }
                `}
              >
                {category.icon}
              </div>
              <span
                className={`text-[11px] sm:text-xs font-medium transition-colors text-center whitespace-nowrap ${
                  isSelected
                    ? "text-gray-900 font-semibold"
                    : "text-gray-600 group-hover:text-gray-900"
                }`}
              >
                {category.name}
              </span>
            </div>
          );
        })}

        {/* ALWAYS ON RIGHT: More Options */}
        <Link
          href="/categories"
          className="flex flex-col items-center justify-center gap-1.5 group shrink-0 select-none text-center min-w-[56px] sm:min-w-[64px]"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-200 group-hover:scale-105 bg-gray-100 text-gray-500 group-hover:bg-gray-200 border border-transparent shrink-0">
            <MoreHorizontal className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.75]" />
          </div>
          <span className="text-[11px] sm:text-xs font-medium text-gray-500 transition-colors group-hover:text-gray-900 text-center whitespace-nowrap">
            More
          </span>
        </Link>
      </div>
    </div>
  );
};

export default Categories;

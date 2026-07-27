"use client";

import {
  Footprints,
  Glasses,
  Briefcase,
  Shirt,
  LayoutGrid,
  Hand,
  Sparkles,
  Layers,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const categories = [
  {
    name: "All",
    icon: <LayoutGrid className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.75]" />,
    slug: "all",
    bgColor: "bg-blue-50 text-blue-600 group-hover:bg-blue-100",
  },
  {
    name: "T-shirts",
    icon: <Shirt className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.75]" />,
    slug: "t-shirt",
    bgColor: "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100",
  },
  {
    name: "Shoes",
    icon: <Footprints className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.75]" />,
    slug: "shoes",
    bgColor: "bg-sky-50 text-sky-600 group-hover:bg-sky-100",
  },
  {
    name: "Accessories",
    icon: <Glasses className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.75]" />,
    slug: "accessories",
    bgColor: "bg-purple-50 text-purple-600 group-hover:bg-purple-100",
  },
  {
    name: "Bags",
    icon: <Briefcase className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.75]" />,
    slug: "bags",
    bgColor: "bg-amber-50 text-amber-600 group-hover:bg-amber-100",
  },
  {
    name: "Dresses",
    icon: <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.75]" />,
    slug: "dresses",
    bgColor: "bg-pink-50 text-pink-600 group-hover:bg-pink-100",
  },
  {
    name: "Jackets",
    icon: <Layers className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.75]" />,
    slug: "jackets",
    bgColor: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100",
  },
  {
    name: "Gloves",
    icon: <Hand className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.75]" />,
    slug: "gloves",
    bgColor: "bg-rose-50 text-rose-600 group-hover:bg-rose-100",
  },
];

const Categories = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentCategory = searchParams.get("category");
  const selectedCategory = !currentCategory ? "all" : currentCategory;

  const handleChange = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug === "all") {
      params.delete("category");
    } else {
      params.set("category", slug);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="w-full bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm mb-6">
      <div className="flex items-center justify-between sm:grid sm:grid-cols-4 md:grid-cols-8 gap-4 overflow-x-auto no-scrollbar py-2">
        {categories.map((category) => {
          const isSelected = selectedCategory === category.slug;

          return (
            <div
              key={category.slug}
              onClick={() => handleChange(category.slug)}
              className="flex flex-col items-center gap-2.5 cursor-pointer group shrink-0 select-none"
            >
              {/* CIRCULAR ICON WRAPPER */}
              <div
                className={`
                  w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center 
                  transition-all duration-200 group-hover:scale-105
                  ${category.bgColor}
                  ${
                    isSelected
                      ? "ring-2 ring-blue-600 ring-offset-2 scale-105 shadow-md"
                      : "border border-transparent"
                  }
                `}
              >
                {category.icon}
              </div>

              {/* CATEGORY LABEL */}
              <span
                className={`text-xs sm:text-sm font-medium transition-colors text-center ${
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
      </div>
    </div>
  );
};

export default Categories;

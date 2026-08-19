import { Metadata } from "next";
import Link from "next/link";
import {
  Shirt,
  Footprints,
  Briefcase,
  Cpu,
  Home,
  ChefHat,
  Wrench,
  Dumbbell,
  Sparkles,
  Baby,
  ArrowRight,
  LayoutGrid,
  TrendingUp,
  LucideIcon,
} from "lucide-react";
import { DEPARTMENTS } from "@/lib/categoryData";
import { SubCategoryChip } from "@/components/CategoryCard";

export const metadata: Metadata = {
  title: "All Departments | Ominify",
  description:
    "Browse all product departments — Fashion, Electronics, Kitchen, Tools, Sports, Beauty and much more. Shop thousands of products across 10 departments.",
};

// ─── Department icon registry (top-level nav only) ─────────────────────────────
const DEPT_ICONS: Record<string, LucideIcon> = {
  Shirt,
  Footprints,
  Briefcase,
  Cpu,
  Home,
  ChefHat,
  Wrench,
  Dumbbell,
  Sparkles,
  Baby,
  LayoutGrid,
};

const CategoriesPage = (): React.ReactNode => {
  const totalSubCategories = DEPARTMENTS.reduce(
    (sum, d) => sum + d.subCategories.length,
    0
  );

  return (
    <div className="flex flex-col gap-8 pb-10">

      {/* ── HERO BANNER ─────────────────────────────────────────────────────── */}
      <div className="rounded-3xl border border-gray-100 bg-white px-6 py-8 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 mb-3">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Browse All Departments</span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900">
              Shop by Department
            </h1>

            <p className="mt-2 text-sm text-gray-500 max-w-xl">
              From fashion to power tools, kitchen essentials to electronics —
              find everything you need across our curated departments.
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <div className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-surface px-4 py-3 shadow-xs">
              <LayoutGrid className="h-5 w-5 text-blue-600" />
              <div>
                <span className="text-xs font-medium text-gray-500 block">Departments</span>
                <span className="text-sm font-bold text-gray-900">{DEPARTMENTS.length}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-surface px-4 py-3 shadow-xs">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              <div>
                <span className="text-xs font-medium text-gray-500 block">Categories</span>
                <span className="text-sm font-bold text-gray-900">{totalSubCategories}+</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── DEPARTMENT QUICK-JUMP NAV ────────────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-xs">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Jump to Department
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide flex-wrap">
          {DEPARTMENTS.map((dept) => {
            const Icon = DEPT_ICONS[dept.icon] ?? LayoutGrid;
            return (
              <a
                key={dept.slug}
                href={`#dept-${dept.slug}`}
                className={`flex shrink-0 items-center gap-1.5 rounded-full border border-gray-100 px-3 py-1.5 text-xs font-semibold transition-all duration-150 hover:border-gray-300 hover:shadow-sm ${dept.bgColor} ${dept.accentColor}`}
              >
                <Icon className="h-3.5 w-3.5" />
                {dept.name}
              </a>
            );
          })}
        </div>
      </div>

      {/* ── DEPARTMENT SECTIONS ──────────────────────────────────────────────── */}
      {DEPARTMENTS.map((dept) => {
        const Icon = DEPT_ICONS[dept.icon] ?? LayoutGrid;

        return (
          <section
            key={dept.slug}
            id={`dept-${dept.slug}`}
            className="scroll-mt-6 rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden"
          >
            {/* Department header — solid colored bg matching home page palette */}
            <div className={`${dept.bgColor} ${dept.borderColor} border-b px-6 py-5`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-xs ${dept.accentColor}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className={`text-lg font-bold text-gray-900`}>{dept.name}</h2>
                    <p className="text-xs text-gray-500 mt-0.5">{dept.description}</p>
                  </div>
                </div>

                <Link
                  href={`/products?category=${dept.slug}`}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold shadow-xs border ${dept.borderColor} ${dept.accentColor} transition-all hover:shadow-sm`}
                >
                  View All
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Sub-category grid */}
            <div className="p-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                {dept.subCategories.map((sub) => (
                  <SubCategoryChip
                    key={sub.slug}
                    sub={sub}
                    accentColor={dept.accentColor}
                    bgColor={dept.bgColor}
                  />
                ))}

                {/* "See all in department" tile */}
                <Link
                  href={`/products?category=${dept.slug}`}
                  className={`group flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-3 py-2.5 text-sm font-semibold transition-all duration-200 hover:opacity-80 ${dept.borderColor} ${dept.accentColor}`}
                >
                  <span className="text-xs">See all</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default CategoriesPage;

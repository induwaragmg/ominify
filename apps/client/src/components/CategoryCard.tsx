"use client";

import Link from "next/link";
import {
  ArrowRight,
  Footprints,
  Glasses,
  Briefcase,
  Shirt,
  LayoutGrid,
  Hand,
  Sparkles,
  Layers,
  Zap,
  Home,
  Cpu,
  Wrench,
  Hammer,
  Headphones,
  Smartphone,
  Plug,
  Keyboard,
  Mouse,
  Camera,
  Watch,
  Volume2,
  CircuitBoard,
  Box,
  Sofa,
  BedDouble,
  Image,
  Flame,
  Lightbulb,
  Columns2,
  Leaf,
  Clock,
  ChefHat,
  Coffee,
  Square,
  Circle,
  GlassWater,
  Utensils,
  Dumbbell,
  Waves,
  Bike,
  Trophy,
  Wind,
  Star,
  Sun,
  Flower,
  Palette,
  User,
  Baby,
  BookOpen,
  Heart,
  Brain,
  Backpack,
  ShoppingBag,
  Wallet,
  Gem,
  Link as LinkIcon,
  PersonStanding,
  Scissors,
  Mountain,
  BriefcaseBusiness,
  Settings,
  ShieldCheck,
  MoveUp,
  Ruler,
  Drill,
  TestTube,
  Gamepad2,
  LucideIcon,
} from "lucide-react";
import { CategoryItem, SubCategory } from "@/lib/categoryData";

// ─── Icon registry ─────────────────────────────────────────────────────────────
export const ICON_MAP: Record<string, LucideIcon> = {
  LayoutGrid,
  Shirt,
  Footprints,
  Glasses,
  Briefcase,
  Sparkles,
  Layers,
  Hand,
  Zap,
  Home,
  Cpu,
  Wrench,
  Hammer,
  Headphones,
  Smartphone,
  Plug,
  Keyboard,
  Mouse,
  Camera,
  Watch,
  Volume2,
  CircuitBoard,
  Box,
  Sofa,
  BedDouble,
  Image,
  Flame,
  Lightbulb,
  Columns2,
  Leaf,
  Clock,
  ChefHat,
  Coffee,
  Square,
  Circle,
  GlassWater,
  Utensils,
  Dumbbell,
  Waves,
  Bike,
  Trophy,
  Wind,
  Star,
  Sun,
  Flower,
  Palette,
  User,
  Baby,
  BookOpen,
  Heart,
  Brain,
  Backpack,
  ShoppingBag,
  Wallet,
  Gem,
  Link: LinkIcon,
  PersonStanding,
  Scissors,
  Mountain,
  BriefcaseBusiness,
  Settings,
  ShieldCheck,
  MoveUp,
  Ruler,
  Drill,
  TestTube,
  Gamepad2,
};

// ─── Badge color map ───────────────────────────────────────────────────────────
const BADGE_STYLES: Record<string, string> = {
  New: "bg-emerald-100 text-emerald-700",
  Hot: "bg-red-100 text-red-600",
  Sale: "bg-orange-100 text-orange-600",
  Popular: "bg-blue-100 text-blue-600",
};

// ─── SubCategoryChip ──────────────────────────────────────────────────────────
interface SubCategoryChipProps {
  sub: SubCategory;
  accentColor: string; // e.g. "text-violet-600"
  bgColor: string;     // e.g. "bg-violet-50"
}

export const SubCategoryChip = ({ sub, accentColor, bgColor }: SubCategoryChipProps): JSX.Element => {
  const Icon = ICON_MAP[sub.icon] ?? LayoutGrid;
  const href = `/products?category=${sub.slug}`;

  return (
    <Link href={href} className="group flex items-center gap-2.5 rounded-2xl border border-gray-100 bg-white px-3 py-2.5 shadow-xs transition-all duration-200 hover:border-gray-200 hover:shadow-sm hover:-translate-y-0.5">
      {/* icon bubble */}
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors duration-200 group-hover:scale-105 ${bgColor} ${accentColor}`}>
        <Icon className="h-4 w-4 stroke-[1.75]" />
      </div>

      {/* name */}
      <span className={`text-sm font-medium text-gray-700 transition-colors group-hover:${accentColor} truncate`}>
        {sub.name}
      </span>

      {/* badge */}
      {sub.badge && (
        <span className={`ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${BADGE_STYLES[sub.badge] ?? "bg-gray-100 text-gray-500"}`}>
          {sub.badge}
        </span>
      )}
    </Link>
  );
};

// ─── Legacy CategoryCard (kept for backward compat) ────────────────────────────
interface CategoryCardProps {
  category: CategoryItem;
}

export const CategoryCard = ({ category }: CategoryCardProps): JSX.Element => {
  const Icon = ICON_MAP[category.iconName] ?? LayoutGrid;
  const href =
    category.slug === "all" ? "/products" : `/products?category=${category.slug}`;

  return (
    <Link href={href} className="block group h-full">
      <div className="h-full bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-5">
            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105 ${category.bgColor} ${category.textColor}`}>
              <Icon className="w-7 h-7 sm:w-8 sm:h-8 stroke-[1.75]" />
            </div>
            {category.itemCountText && (
              <span className="text-[11px] font-semibold tracking-wide uppercase px-3 py-1 rounded-full bg-surface text-gray-500 border border-gray-100">
                {category.itemCountText}
              </span>
            )}
          </div>
          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {category.name}
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed mt-2 line-clamp-2">
            {category.description}
          </p>
        </div>
        <div className="pt-6 mt-4 border-t border-gray-50 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
            Explore Collection
          </span>
          <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;

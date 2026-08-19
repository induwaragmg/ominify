// ─── Sub-category (leaf node) ────────────────────────────────────────────────
export interface SubCategory {
  name: string;
  slug: string; // used as ?category=<slug> query param
  icon: string; // lucide icon name
  badge?: "New" | "Hot" | "Sale" | "Popular";
}

// ─── Department (top-level bucket) ───────────────────────────────────────────
export interface Department {
  name: string;
  slug: string;
  icon: string;
  accentColor: string; // tailwind text color  e.g. "text-indigo-600"
  bgColor: string; // tailwind bg color       e.g. "bg-indigo-50"
  hoverBgColor: string; // tailwind hover bg   e.g. "group-hover:bg-indigo-100"
  borderColor: string; // tailwind border      e.g. "border-indigo-200"
  description: string;
  subCategories: SubCategory[];
}

// ─────────────────────────────────────────────────────────────────────────────
export const DEPARTMENTS: Department[] = [
  // ── 1. FASHION ─────────────────────────────────────────────────────────────
  {
    name: "Fashion",
    slug: "fashion",
    icon: "Shirt",
    accentColor: "text-indigo-600",
    bgColor: "bg-indigo-50",
    hoverBgColor: "group-hover:bg-indigo-100",
    borderColor: "border-indigo-200",
    description: "Clothing, streetwear & everyday style essentials.",
    subCategories: [
      { name: "T-shirts", slug: "t-shirt", icon: "Shirt", badge: "Popular" },
      { name: "Jeans", slug: "jeans", icon: "PersonStanding", badge: "Hot" },
      { name: "Hoodies", slug: "hoodies", icon: "Layers" },
      { name: "Dresses", slug: "dresses", icon: "Sparkles", badge: "New" },
      { name: "Shorts", slug: "shorts", icon: "Scissors" },
      { name: "Jackets", slug: "jackets", icon: "Wind" },
      { name: "Activewear", slug: "activewear", icon: "Zap", badge: "Hot" },
      { name: "Formal Wear", slug: "formal-wear", icon: "BriefcaseBusiness" },
      { name: "Innerwear", slug: "innerwear", icon: "Heart" },
      { name: "Ethnic Wear", slug: "ethnic-wear", icon: "Star", badge: "New" },
    ],
  },

  // ── 2. SHOES & FOOTWEAR ─────────────────────────────────────────────────────
  {
    name: "Shoes & Footwear",
    slug: "shoes",
    icon: "Footprints",
    accentColor: "text-sky-600",
    bgColor: "bg-sky-50",
    hoverBgColor: "group-hover:bg-sky-100",
    borderColor: "border-sky-200",
    description: "Sneakers, boots & stylish everyday footwear.",
    subCategories: [
      { name: "Sneakers", slug: "sneakers", icon: "Footprints", badge: "Hot" },
      { name: "Running Shoes", slug: "running-shoes", icon: "Zap" },
      { name: "Boots", slug: "boots", icon: "Mountain" },
      { name: "Sandals", slug: "sandals", icon: "Sun" },
      { name: "Formal Shoes", slug: "formal-shoes", icon: "BriefcaseBusiness" },
      { name: "Slippers", slug: "slippers", icon: "Home" },
      { name: "Sports Cleats", slug: "sports-cleats", icon: "Trophy" },
      { name: "Loafers", slug: "loafers", icon: "Footprints", badge: "New" },
    ],
  },

  // ── 3. BAGS & ACCESSORIES ───────────────────────────────────────────────────
  {
    name: "Bags & Accessories",
    slug: "accessories",
    icon: "Briefcase",
    accentColor: "text-amber-600",
    bgColor: "bg-amber-50",
    hoverBgColor: "group-hover:bg-amber-100",
    borderColor: "border-amber-200",
    description: "Bags, wallets, watches & lifestyle accessories.",
    subCategories: [
      { name: "Backpacks", slug: "backpacks", icon: "Backpack", badge: "Popular" },
      { name: "Tote Bags", slug: "tote-bags", icon: "ShoppingBag" },
      { name: "Shoulder Bags", slug: "shoulder-bags", icon: "Briefcase" },
      { name: "Wallets", slug: "wallets", icon: "Wallet" },
      { name: "Sunglasses", slug: "sunglasses", icon: "Glasses" },
      { name: "Watches", slug: "watches", icon: "Watch", badge: "Hot" },
      { name: "Jewelry", slug: "jewelry", icon: "Gem", badge: "New" },
      { name: "Belts", slug: "belts", icon: "Link" },
      { name: "Hats & Caps", slug: "hats", icon: "PersonStanding" },
      { name: "Scarves", slug: "scarves", icon: "Wind" },
    ],
  },

  // ── 4. ELECTRONICS ──────────────────────────────────────────────────────────
  {
    name: "Electronics",
    slug: "electronics",
    icon: "Cpu",
    accentColor: "text-blue-600",
    bgColor: "bg-blue-50",
    hoverBgColor: "group-hover:bg-blue-100",
    borderColor: "border-blue-200",
    description: "Gadgets, audio, phone accessories & computer peripherals.",
    subCategories: [
      { name: "Headphones", slug: "headphones", icon: "Headphones", badge: "Hot" },
      { name: "Earbuds", slug: "earbuds", icon: "Headphones", badge: "New" },
      { name: "Phone Cases", slug: "phone-cases", icon: "Smartphone" },
      { name: "Chargers & Cables", slug: "chargers", icon: "Plug" },
      { name: "Keyboards", slug: "keyboards", icon: "Keyboard" },
      { name: "Mice", slug: "mice", icon: "Mouse" },
      { name: "Webcams", slug: "webcams", icon: "Camera" },
      { name: "Smart Watches", slug: "smart-watches", icon: "Watch", badge: "Popular" },
      { name: "Speakers", slug: "speakers", icon: "Volume2" },
      { name: "USB Hubs", slug: "usb-hubs", icon: "CircuitBoard" },
    ],
  },

  // ── 5. HOME & LIVING ────────────────────────────────────────────────────────
  {
    name: "Home & Living",
    slug: "home",
    icon: "Home",
    accentColor: "text-emerald-600",
    bgColor: "bg-emerald-50",
    hoverBgColor: "group-hover:bg-emerald-100",
    borderColor: "border-emerald-200",
    description: "Décor, bedding, storage & everything for your home.",
    subCategories: [
      { name: "Cushions & Pillows", slug: "cushions", icon: "Sofa" },
      { name: "Bedding", slug: "bedding", icon: "BedDouble", badge: "Popular" },
      { name: "Wall Art", slug: "wall-art", icon: "Image", badge: "New" },
      { name: "Candles", slug: "candles", icon: "Flame" },
      { name: "Storage & Organizers", slug: "storage", icon: "Box" },
      { name: "Lighting", slug: "lighting", icon: "Lightbulb", badge: "Hot" },
      { name: "Rugs & Mats", slug: "rugs", icon: "LayoutGrid" },
      { name: "Curtains", slug: "curtains", icon: "Columns2" },
      { name: "Plants & Pots", slug: "plants", icon: "Leaf", badge: "New" },
      { name: "Clocks", slug: "clocks", icon: "Clock" },
    ],
  },

  // ── 6. KITCHEN & DINING ─────────────────────────────────────────────────────
  {
    name: "Kitchen & Dining",
    slug: "kitchen",
    icon: "ChefHat",
    accentColor: "text-rose-600",
    bgColor: "bg-rose-50",
    hoverBgColor: "group-hover:bg-rose-100",
    borderColor: "border-rose-200",
    description: "Cookware, appliances, utensils & dining essentials.",
    subCategories: [
      { name: "Cookware Sets", slug: "cookware", icon: "ChefHat", badge: "Popular" },
      { name: "Kitchen Knives", slug: "kitchen-knives", icon: "Scissors", badge: "Hot" },
      { name: "Blenders & Mixers", slug: "blenders", icon: "Cpu" },
      { name: "Coffee & Tea", slug: "coffee", icon: "Coffee", badge: "Hot" },
      { name: "Bakeware", slug: "bakeware", icon: "Square" },
      { name: "Plates & Bowls", slug: "dinnerware", icon: "Circle" },
      { name: "Glasses & Mugs", slug: "mugs", icon: "GlassWater" },
      { name: "Food Storage", slug: "food-storage", icon: "Box" },
      { name: "Toasters & Ovens", slug: "toasters", icon: "Flame" },
      { name: "Cutlery Sets", slug: "cutlery", icon: "Utensils", badge: "New" },
    ],
  },

  // ── 7. TOOLS & HARDWARE ─────────────────────────────────────────────────────
  {
    name: "Tools & Hardware",
    slug: "tools",
    icon: "Wrench",
    accentColor: "text-orange-600",
    bgColor: "bg-orange-50",
    hoverBgColor: "group-hover:bg-orange-100",
    borderColor: "border-orange-200",
    description: "Power tools, hand tools & workshop essentials.",
    subCategories: [
      { name: "Power Drills", slug: "power-drills", icon: "Drill", badge: "Popular" },
      { name: "Angle Grinders", slug: "angle-grinders", icon: "Zap" },
      { name: "Circular Saws", slug: "circular-saws", icon: "Circle" },
      { name: "Screwdrivers", slug: "screwdrivers", icon: "Wrench" },
      { name: "Hammers & Mallets", slug: "hammers", icon: "Hammer" },
      { name: "Measuring Tools", slug: "measuring-tools", icon: "Ruler" },
      { name: "Toolboxes", slug: "toolboxes", icon: "Box", badge: "Hot" },
      { name: "Safety Gear", slug: "safety-gear", icon: "ShieldCheck", badge: "New" },
      { name: "Ladders", slug: "ladders", icon: "MoveUp" },
      { name: "Fasteners & Bolts", slug: "fasteners", icon: "Settings" },
    ],
  },

  // ── 8. SPORTS & FITNESS ─────────────────────────────────────────────────────
  {
    name: "Sports & Fitness",
    slug: "sports",
    icon: "Dumbbell",
    accentColor: "text-green-600",
    bgColor: "bg-green-50",
    hoverBgColor: "group-hover:bg-green-100",
    borderColor: "border-green-200",
    description: "Gym gear, outdoor sports & fitness equipment.",
    subCategories: [
      { name: "Gym Wear", slug: "gym-wear", icon: "Dumbbell", badge: "Popular" },
      { name: "Yoga Mats", slug: "yoga-mats", icon: "Layers" },
      { name: "Water Bottles", slug: "water-bottles", icon: "GlassWater" },
      { name: "Resistance Bands", slug: "resistance-bands", icon: "Link" },
      { name: "Dumbbells", slug: "dumbbells", icon: "Dumbbell", badge: "Hot" },
      { name: "Protein & Supplements", slug: "supplements", icon: "TestTube" },
      { name: "Running Gear", slug: "running-gear", icon: "Zap" },
      { name: "Cycling", slug: "cycling", icon: "Bike" },
      { name: "Swimming", slug: "swimming", icon: "Waves" },
      { name: "Team Sports", slug: "team-sports", icon: "Trophy", badge: "New" },
    ],
  },

  // ── 9. BEAUTY & CARE ────────────────────────────────────────────────────────
  {
    name: "Beauty & Care",
    slug: "beauty",
    icon: "Sparkles",
    accentColor: "text-pink-600",
    bgColor: "bg-pink-50",
    hoverBgColor: "group-hover:bg-pink-100",
    borderColor: "border-pink-200",
    description: "Skincare, haircare, fragrances & grooming essentials.",
    subCategories: [
      { name: "Skincare", slug: "skincare", icon: "Sparkles", badge: "Popular" },
      { name: "Haircare", slug: "haircare", icon: "Wind" },
      { name: "Fragrances", slug: "fragrances", icon: "Flower" },
      { name: "Makeup", slug: "makeup", icon: "Palette", badge: "Hot" },
      { name: "Men's Grooming", slug: "mens-grooming", icon: "User" },
      { name: "Nail Care", slug: "nail-care", icon: "Scissors" },
      { name: "Oral Care", slug: "oral-care", icon: "Star" },
      { name: "Sunscreen", slug: "sunscreen", icon: "Sun", badge: "New" },
    ],
  },

  // ── 10. KIDS & BABY ─────────────────────────────────────────────────────────
  {
    name: "Kids & Baby",
    slug: "kids",
    icon: "Baby",
    accentColor: "text-purple-600",
    bgColor: "bg-purple-50",
    hoverBgColor: "group-hover:bg-purple-100",
    borderColor: "border-purple-200",
    description: "Toys, clothing, baby gear & school supplies.",
    subCategories: [
      { name: "Kids Clothing", slug: "kids-clothing", icon: "Shirt", badge: "Popular" },
      { name: "Toys & Games", slug: "toys", icon: "Gamepad2", badge: "Hot" },
      { name: "Baby Gear", slug: "baby-gear", icon: "Baby" },
      { name: "School Supplies", slug: "school-supplies", icon: "BookOpen", badge: "New" },
      { name: "Kids Shoes", slug: "kids-shoes", icon: "Footprints" },
      { name: "Baby Skincare", slug: "baby-skincare", icon: "Heart" },
      { name: "Educational Toys", slug: "educational-toys", icon: "Brain" },
      { name: "Kids Bags", slug: "kids-bags", icon: "Backpack" },
    ],
  },
];

// ── Backward-compat export (still used by old CategoryCard if needed) ──────────
export interface CategoryItem {
  name: string;
  slug: string;
  iconName: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  description: string;
  itemCountText?: string;
}

/** @deprecated Use DEPARTMENTS instead */
export const CATEGORIES_DATA: CategoryItem[] = DEPARTMENTS.map((d) => ({
  name: d.name,
  slug: d.slug,
  iconName: d.icon,
  bgColor: d.bgColor,
  textColor: d.accentColor,
  borderColor: d.borderColor,
  description: d.description,
}));

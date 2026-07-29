"use client";

import useCartStore from "@/stores/cartStore";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";

const ShoppingCartIcon = (): JSX.Element | null => {
  const { cart, hasHydrated } = useCartStore();

  if (!hasHydrated) return null;
  const count = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Link
      href="/cart"
      className="relative flex shrink-0 h-10 w-10 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm transition hover:text-gray-900"
    >
      <ShoppingCart className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-white shadow-xs">
          {count}
        </span>
      )}
    </Link>
  );
};

export default ShoppingCartIcon;
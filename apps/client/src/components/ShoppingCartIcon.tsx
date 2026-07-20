"use client";

import useCartStore from "@/stores/cartStore";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";

const ShoppingCartIcon = () => {
  const { cart, hasHydrated } = useCartStore();

  if (!hasHydrated) return null;
  return (
    <Link href="/cart" className="relative">
      <div className="w-10 h-10  bg-white  p-2 rounded-full shadow-sm flex items-center justify-center">
      <ShoppingCart className="w-6 h-6 text-gray-500  bg-white" />
      </div>
      <span className="absolute -top-1 -right-1 bg-brand text-white rounded-full w-4.5 h-4.5 flex items-center justify-center text-xs font-medium">
        {cart.reduce((acc, item) => acc + item.quantity, 0)}
      </span>
    </Link>
  );
};

export default ShoppingCartIcon;
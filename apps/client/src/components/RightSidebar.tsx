"use client";

import useCartStore from "@/stores/cartStore";
import type { CartItemType } from "@repo/types";
import {
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

const recommendedItems = [
  {
    id: 1,
    name: "Ray-Ban Wayfarer",
    price: 159,
    image: "/products/4w.png",
  },
  {
    id: 2,
    name: "Nike Air Force",
    price: 109.99,
    image: "/products/6w.png",
  },
];

function getItemImage(item: CartItemType): string {
  const images = item.images as Record<string, string> | undefined;
  return images?.[item.selectedColor] ?? Object.values(images ?? {})[0] ?? "/products/1g.png";
}

export default function RightSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { cart, removeFromCart } = useCartStore();

   if (pathname !== "/") {
    return null;
  }

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const discount = subtotal > 0 ? subtotal * 0.1 : 0;
  const shipping: number = 0;
  const total = subtotal - discount + shipping;

  return (
    <aside className="hidden w-90 shrink-0 self-start pl-4 pr-2 py-3 lg:block">
      <div className="flex flex-col gap-4">

        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-950">
              My Cart ({cart.length})
            </h2>
            {/* <button
              type="button"
              aria-label="Close cart"
              className="flex size-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              <X className="size-4" />
            </button> */}
          </div>

          <div className="max-h-35 overflow-y-auto pr-2" >
          <div className="flex flex-col gap-3" >
            {cart.length === 0 ? (
              <div className="rounded-xl bg-gray-50 px-4 py-8 text-center">
                <ShoppingBag className="mx-auto mb-1 size-8 text-gray-300" />
                <p className="text-sm font-medium text-gray-900">
                  Your cart is empty
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Products you add will appear here.
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <article
                  key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
                  className="grid grid-cols-[88px_1fr] gap-3"
                >
                  <div className="relative size-[88px] overflow-hidden rounded-xl bg-gray-100">
                    <Image
                      src={getItemImage(item)}
                      alt={item.name}
                      fill
                      sizes="88px"
                      className="object-contain p-2"
                    />
                    {/* <button
                      type="button"
                      aria-label="Add to wishlist"
                      className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm"
                    >
                      <Heart className="size-3.5" />
                    </button> */}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-gray-950">
                          {item.name}
                        </h3>
                        <p className="mt-0.5 text-xs text-gray-500">
                          Size: {item.selectedSize}
                        </p>
                        <p className="text-xs text-gray-500">
                          Color: {item.selectedColor}
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove ${item.name}`}
                        onClick={() => removeFromCart(item)}
                        className="shrink-0 rounded-full p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-gray-950">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <div className="flex h-8 items-center gap-2 rounded-full border border-gray-200 px-2 text-gray-600">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          className="flex size-5 items-center justify-center rounded-full hover:bg-gray-100"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="min-w-4 text-center text-xs font-medium">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          className="flex size-5 items-center justify-center rounded-full hover:bg-gray-100"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
          </div>

          <div className="mt-5 flex gap-2">
            <input
              type="text"
              placeholder="Promo Code"
              className="h-10 min-w-0 flex-1 rounded-lg border border-gray-200 px-3 text-sm text-gray-700 outline-none transition-colors placeholder:text-gray-400 focus:border-blue-500"
            />
            <button
              type="button"
              className="h-10 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Apply
            </button>
          </div>

          <div className="mt-5 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-medium text-gray-950">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Discount</span>
              <span className="font-medium text-red-500">
                -${discount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span className="font-medium text-blue-600">
                {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-3 font-semibold text-gray-950">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="button"
            className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
            onClick={() => router.push("/cart?step=2", { scroll: false })}
          >
            <ShoppingBag className="size-4" />
            Checkout ({cart.length})
          </button>
        </section>

       
        <section className="overflow-hidden rounded-2xl  bg-linear-to-br from-blue-600 via-blue-500 to-green-200 p-5 text-white shadow-[0_18px_50px_rgba(37,99,235,0.25)]">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Join Ominify Club</h2>
              <p className="mt-2 text-xs leading-5 text-white/85">
                Get exclusive offers, early access and more.
              </p>
              <button
                type="button"
                className="mt-4 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-blue-600"
              >
                Join Now
              </button>
            </div>
            <div className="relative size-20 shrink-0 rounded-2xl bg-white/15">
              <ShoppingBag className="absolute bottom-4 left-4 size-10 text-white" />
              <div className="absolute right-3 top-3 size-5 rounded-full bg-yellow-300" />
            </div>
          </div>
        </section>
       
        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-950">
              You might also like
            </h2>
            <button
              type="button"
              className="rounded-full bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600"
            >
              View All
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {recommendedItems.map((item) => (
              <article key={item.id} className="min-w-0">
                <div className="relative mb-2 h-16 overflow-hidden rounded-lg bg-gray-100">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="140px"
                    className="object-contain p-2"
                  />
                </div>
                <h3 className="truncate text-xs font-medium text-gray-950">
                  {item.name}
                </h3>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-gray-950">
                    ${item.price.toFixed(2)}
                  </p>
                  <button
                    type="button"
                    aria-label={`Add ${item.name}`}
                    className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

       
      </div>
    </aside>
  );
}

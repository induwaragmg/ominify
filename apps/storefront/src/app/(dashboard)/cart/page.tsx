"use client";

// import PaymentForm from "@/components/PaymentForm";
import ShippingForm from "@/components/ShippingForm";
import StripePaymentForm from "@/components/StripePaymentForm";
import useCartStore from "@/stores/cartStore";
import { CartItemsType, ShippingFormInputs } from "@repo/types";
import { ArrowRight, Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const steps = [
  {
    id: 1,
    title: "Shopping Cart",
  },
  {
    id: 2,
    title: "Shipping Address",
  },
  {
    id: 3,
    title: "Payment Method",
  },
];

// TEMPORARY
// const cartItems: CartItemsType = [
//   {
//     id: 1,
//     name: "Adidas CoreFit T-Shirt",
//     shortDescription:
//       "Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit.",
//     description:
//       "Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit. Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit. Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit.",
//     price: 39.9,
//     sizes: ["s", "m", "l", "xl", "xxl"],
//     colors: ["gray", "purple", "green"],
//     images: {
//       gray: "/products/1g.png",
//       purple: "/products/1p.png",
//       green: "/products/1gr.png",
//     },
//     quantity: 1,
//     selectedSize: "m",
//     selectedColor: "gray",
//   },
//   {
//     id: 2,
//     name: "Puma Ultra Warm Zip",
//     shortDescription:
//       "Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit.",
//     description:
//       "Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit. Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit. Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit.",
//     price: 59.9,
//     sizes: ["s", "m", "l", "xl"],
//     colors: ["gray", "green"],
//     images: { gray: "/products/2g.png", green: "/products/2gr.png" },
//     quantity: 1,
//     selectedSize: "l",
//     selectedColor: "gray",
//   },
//   {
//     id: 3,
//     name: "Nike Air Essentials Pullover",
//     shortDescription:
//       "Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit.",
//     description:
//       "Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit. Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit. Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit.",
//     price: 69.9,
//     sizes: ["s", "m", "l"],
//     colors: ["green", "blue", "black"],
//     images: {
//       green: "/products/3gr.png",
//       blue: "/products/3b.png",
//       black: "/products/3bl.png",
//     },
//     quantity: 1,
//     selectedSize: "l",
//     selectedColor: "black",
//   },
// ];

const CartPage = (): React.ReactNode => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [shippingForm, setShippingForm] = useState<ShippingFormInputs>();

  const activeStep = parseInt(searchParams.get("step") || "1");

  const { cart, removeFromCart, updateCartItem } = useCartStore();
  console.log(cart);
  return (
    // <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <div className="">
      <div className="flex flex-col gap-4">
        <div className="rounded-3xl bg-white px-6 py-8 shadow-sm border border-gray-100">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">Your Shopping Cart</h1>
              <p className="mt-2 text-sm text-gray-500">
                Review items, update quantities, and continue to checkout with a consistent homepage look.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`rounded-3xl border p-4 text-center transition-shadow duration-300 ${
                  step.id === activeStep
                    ? "border-brand bg-brand shadow-md transfrom-transition-all duration-300"
                    : "border-gray-200 bg-surface text-gray-500 hover:shadow-sm"
                }`}
              >
                <div
                  className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-brand ${
                    step.id === activeStep ? "bg-white" : "bg-brand text-white"
                  }`}
                >
                  {step.id}
                </div>
                <p className={`text-sm font-medium text-brand ${
                    step.id === activeStep ? "text-white" : " text-brand"
                  }`}>{step.title}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
          
          <div className="order-2 lg:order-1 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            {activeStep === 1 ? (
              <div className="space-y-4">
                {cart.length === 0 ? (
                  <div className="rounded-2xl bg-surface p-8 text-center text-gray-500">
                    Your cart is currently empty.
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      className="flex flex-col gap-4 rounded-3xl border border-gray-100 bg-surface p-5 sm:flex-row sm:items-center sm:justify-between"
                      key={item.id + item.selectedSize + item.selectedColor}
                    >
                      <div className="flex gap-4 sm:gap-6">
                        <div className="relative h-28 w-28 overflow-hidden rounded-3xl bg-gray-50 shrink-0">
                          <Image
                            src={(item.images as Record<string, string>)?.[item.selectedColor] || ""}
                            alt={item.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <div className="flex flex-col justify-between gap-3">
                          <div className="space-y-2">
                            <p className="text-lg font-semibold text-gray-900">{item.name}</p>
                            
                            <div className="flex flex-wrap items-center gap-3">
                              {/* SIZE SELECT */}
                              {item.sizes && item.sizes.length > 0 && (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-medium text-gray-500">Size:</span>
                                  <Select
                                    value={item.selectedSize}
                                    onValueChange={(value) =>
                                      value && updateCartItem(item, { selectedSize: value })
                                    }
                                  >
                                    <SelectTrigger className="ring ring-gray-200/80 rounded-full text-xs text-gray-800 bg-white border border-gray-200 shadow-none outline-none flex items-center justify-between gap-1 min-w-[54px] cursor-pointer px-2.5 py-1 hover:bg-gray-50 transition [&_svg]:size-3.5">
                                      <SelectValue>
                                        <span className="uppercase font-semibold text-xs">{item.selectedSize}</span>
                                      </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent className="bg-white text-black min-w-[80px] rounded-xl p-1 shadow-xl z-50">
                                      {item.sizes.map((size) => (
                                        <SelectItem
                                          key={size}
                                          value={size}
                                          className="flex items-center gap-2 cursor-pointer rounded-lg px-2 py-1 text-xs text-black hover:bg-gray-100 focus:bg-gray-100"
                                        >
                                          <span className="uppercase font-medium">{size}</span>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}

                              {/* COLOR SELECT */}
                              {item.colors && item.colors.length > 0 && (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-medium text-gray-500">Color:</span>
                                  <Select
                                    value={item.selectedColor}
                                    onValueChange={(value) =>
                                      value && updateCartItem(item, { selectedColor: value })
                                    }
                                  >
                                    <SelectTrigger className="ring ring-gray-200/80 rounded-full text-xs text-gray-800 bg-white border border-gray-200 shadow-none outline-none flex items-center justify-between gap-1.5 min-w-[76px] cursor-pointer px-2.5 py-1 hover:bg-gray-50 transition [&_svg]:size-3.5">
                                      <SelectValue>
                                        <div className="flex items-center gap-1.5">
                                          <div
                                            className="h-3 w-3 rounded-full shrink-0 border border-gray-300"
                                            style={{ backgroundColor: item.selectedColor }}
                                          />
                                          <span className="capitalize font-medium text-xs">{item.selectedColor}</span>
                                        </div>
                                      </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent className="bg-white text-black min-w-[100px] rounded-xl p-1 shadow-xl z-50">
                                      {item.colors.map((color) => (
                                        <SelectItem
                                          key={color}
                                          value={color}
                                          className="flex items-center gap-2 cursor-pointer rounded-lg px-2 py-1.5 text-xs text-black hover:bg-gray-100 focus:bg-gray-100"
                                        >
                                          <div
                                            className="h-3 w-3 rounded-full shrink-0 border border-gray-300"
                                            style={{ backgroundColor: color }}
                                          />
                                          <span className="capitalize font-medium">{color}</span>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}

                              {/* QUANTITY CONTROL */}
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-medium text-gray-500">Qty:</span>
                                <div className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2 py-0.5 text-gray-700 shadow-xs">
                                  <button
                                    type="button"
                                    onClick={() => updateCartItem(item, { quantity: Math.max(1, item.quantity - 1) })}
                                    disabled={item.quantity <= 1}
                                    className="flex h-5 w-5 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
                                    aria-label="Decrease quantity"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </button>
                                  <span className="min-w-4 text-center text-xs font-semibold text-gray-900">
                                    {item.quantity}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => updateCartItem(item, { quantity: item.quantity + 1 })}
                                    className="flex h-5 w-5 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
                                    aria-label="Increase quantity"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => removeFromCart(item)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600 transition hover:bg-red-100 cursor-pointer self-start sm:self-center"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            ) : activeStep === 2 ? (
              <ShippingForm setShippingForm={setShippingForm} />
            ) : activeStep === 3 && shippingForm ? (
              <StripePaymentForm shippingForm={shippingForm} />
            ) : (
              <p className="text-sm text-gray-500">
                Please fill in the shipping form to continue.
              </p>
            )}
          </div>

          <div className="order-1 lg:order-2 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-brand">Order Summary</h2>
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <p>Subtotal</p>
                <p>${cart.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)}</p>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <p>Discount (10%)</p>
                <p>$10.00</p>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <p>Shipping Fee</p>
                <p>$10.00</p>
              </div>
              <div className="border-t border-brand pt-4">
                <div className="flex items-center justify-between text-base font-semibold text-brand">
                  <p>Total</p>
                  <p>${cart.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)}</p>
                </div>
              </div>
            </div>

            {activeStep === 1 && (
              <button
                onClick={() => router.push("/cart?step=2", { scroll: false })}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand/90"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
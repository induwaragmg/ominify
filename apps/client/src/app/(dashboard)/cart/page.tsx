"use client";

// import PaymentForm from "@/components/PaymentForm";
import ShippingForm from "@/components/ShippingForm";
import StripePaymentForm from "@/components/StripePaymentForm";
import useCartStore from "@/stores/cartStore";
import { CartItemsType, ShippingFormInputs } from "@repo/types";
import { ArrowRight, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

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

const CartPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [shippingForm, setShippingForm] = useState<ShippingFormInputs>();

  const activeStep = parseInt(searchParams.get("step") || "1");

  const { cart, removeFromCart } = useCartStore();
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
                {cart.map((item) => (
                  <div
                    className="flex flex-col gap-4 rounded-3xl border border-gray-100 bg-surface p-5 sm:flex-row sm:items-center sm:justify-between"
                    key={item.id + item.selectedSize + item.selectedColor}
                  >
                    <div className="flex gap-4 sm:gap-6">
                      <div className="relative h-28 w-28 overflow-hidden rounded-3xl bg-gray-50">
                        <Image
                          src={(item.images as Record<string, string>)?.[item.selectedColor] || ""}
                          alt={item.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div className="flex flex-col justify-between gap-3">
                        <div className="space-y-1">
                          <p className="text-lg font-semibold text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                          <p className="text-sm text-gray-500">Size: {item.selectedSize}</p>
                          <p className="text-sm text-gray-500">Color: {item.selectedColor}</p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600 transition hover:bg-red-100"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
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
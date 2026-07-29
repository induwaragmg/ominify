"use client";

import { ShippingFormInputs } from "@repo/types";
import {
  PaymentElement,
  useCheckoutElements,
} from "@stripe/react-stripe-js/checkout";
import { useState } from "react";
import { Loader2, AlertCircle, Lock, ShieldCheck, CreditCard } from "lucide-react";
import useCartStore from "@/stores/cartStore";
import PaymentSuccessModal from "./PaymentSuccessModal";

const CheckoutForm = ({
  shippingForm,
}: {
  shippingForm: ShippingFormInputs;
}): JSX.Element => {
  const checkoutState = useCheckoutElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const { clearCart } = useCartStore();

  // ─── INITIALIZING LOADING STATE (Stripe Setup) ──────────────────────────────
  if (checkoutState.type === "loading") {
    return (
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-brand">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Stripe Payment Gateway
              </h3>
              <p className="text-xs text-gray-500">
                Connecting to Stripe secure checkout...
              </p>
            </div>
          </div>
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-600 border border-blue-100">
            Option: Stripe
          </span>
        </div>

        {/* Skeleton Shimmer Fields */}
        <div className="space-y-4 animate-pulse">
          <div className="h-12 w-full rounded-2xl bg-gray-100" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-12 w-full rounded-2xl bg-gray-100" />
            <div className="h-12 w-full rounded-2xl bg-gray-100" />
          </div>
          <div className="h-12 w-full rounded-2xl bg-gray-100" />
        </div>

        {/* Centered Loading Spinner */}
        <div className="mt-8 flex flex-col items-center justify-center gap-2 py-4">
          <Loader2 className="h-7 w-7 animate-spin text-brand" />
          <span className="text-xs font-medium text-gray-500">
            Initializing Stripe 256-bit SSL encrypted gateway...
          </span>
        </div>
      </div>
    );
  }

  // ─── INITIALIZATION ERROR STATE ─────────────────────────────────────────────
  if (checkoutState.type === "error") {
    return (
      <div className="rounded-3xl border border-red-100 bg-red-50/50 p-6 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 mb-3">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-gray-900">
          Stripe Connection Error
        </h3>
        <p className="mt-1 text-sm text-red-600 max-w-sm mx-auto">
          {checkoutState.error.message}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 rounded-full bg-white px-5 py-2 text-xs font-semibold text-gray-700 border border-gray-200 shadow-xs hover:bg-gray-50"
        >
          Try Again
        </button>
      </div>
    );
  }

  const checkout = checkoutState.checkout;

  const handleClick = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await checkout.updateEmail(shippingForm.email);

      await checkout.updateShippingAddress({
        name: "shipping_address",
        address: {
          line1: shippingForm.address,
          city: shippingForm.city,
          country: "US", // Default assumption
        },
      });

      const res = await checkout.confirm();
      if (res.type === "error") {
        setError(res.error.message);
      } else {
        clearCart();
        setIsSuccess(true);
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* SUCCESS FULL-SCREEN BLURRED MODAL */}
      {isSuccess && (
        <PaymentSuccessModal
          title="Payment Successful!"
          subtitle="Your payment has been authorized and your order is confirmed. Thank you for shopping with Ominify."
        />
      )}

      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        {/* Header Badge */}
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-brand">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-gray-900">
                  Stripe Payment
                </h3>
                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  Stripe
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Pay securely via Credit Card, Debit, or Digital Wallet
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Stripe SSL Verified</span>
          </div>
        </div>

        <form onSubmit={handleClick}>
          {/* Stripe Payment Element */}
          <div className="min-h-[160px]">
            <PaymentElement options={{ layout: "accordion" }} />
          </div>

          {/* Submission Error Alert */}
          {error && (
            <div className="mt-4 flex items-center gap-2.5 rounded-2xl border border-red-100 bg-red-50 p-3.5 text-xs font-medium text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Pay Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3.5 px-6 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-brand-hover disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                <span>Processing via Stripe...</span>
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 text-white/80" />
                <span>Pay via Stripe</span>
              </>
            )}
          </button>

          <p className="mt-3 text-center text-[11px] text-gray-400">
            Transactions are processed securely by Stripe. Additional payment methods coming soon.
          </p>
        </form>
      </div>
    </>
  );
};

export default CheckoutForm;
"use client";

import { Check, Package, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";

interface PaymentSuccessModalProps {
  title?: string;
  subtitle?: string;
  orderId?: string;
  onClose?: () => void;
}

export const PaymentSuccessModal = ({
  title = "Payment Successful!",
  subtitle = "Thank you for your purchase. Your order has been confirmed and is now being processed.",
  orderId,
}: PaymentSuccessModalProps): JSX.Element => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-md p-4 transition-all duration-300 animate-in fade-in-0">
      {/* MODAL CARD */}
      <div className="relative w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-300">
        
        {/* ANIMATED CHECKMARK ICON */}
        <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 shadow-xl shadow-emerald-500/20 ring-8 ring-emerald-50/50">
          <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping" />
          <Check className="h-10 w-10 stroke-[3] text-emerald-600 relative z-10 transition-transform duration-300" />
        </div>

        {/* STATUS BADGE */}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-600 border border-emerald-100 uppercase tracking-wider mb-3">
          ● Order Confirmed
        </span>

        {/* HEADING & SUBTITLE */}
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="mt-2 text-sm text-gray-500 leading-relaxed max-w-sm mx-auto">
          {subtitle}
        </p>

        {/* ORDER ID CHIP (Optional) */}
        {orderId && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-surface px-4 py-2 text-xs font-semibold text-gray-700 border border-gray-100">
            <Package className="h-4 w-4 text-brand" />
            <span>Order Reference: {orderId}</span>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="mt-7 flex flex-col gap-3">
          <Link
            href="/orders"
            className="flex items-center justify-center gap-2 rounded-full bg-brand py-3.5 px-6 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-hover"
          >
            <Package className="h-4 w-4" />
            <span>View My Orders</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/products"
            className="flex items-center justify-center gap-2 rounded-full bg-surface py-3 px-6 text-sm font-semibold text-gray-700 border border-gray-200 transition-all hover:bg-gray-100"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* FOOTER NOTE */}
        <p className="mt-5 text-[11px] text-gray-400">
          A receipt has been sent to your email address.
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccessModal;

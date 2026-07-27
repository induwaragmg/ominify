import PaymentSuccessModal from "@/components/PaymentSuccessModal";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

const ReturnPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }> | undefined;
}): Promise<JSX.Element> => {
  const sessionId = (await searchParams)?.session_id;

  if (!sessionId) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 mb-3">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">No Checkout Session Found</h2>
        <p className="mt-1 text-sm text-gray-500 max-w-sm">
          We couldn&apos;t retrieve your payment session details.
        </p>
        <Link
          href="/orders"
          className="mt-5 rounded-full bg-brand px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-brand-hover"
        >
          Check My Orders
        </Link>
      </div>
    );
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL}/sessions/${sessionId}`,
      { cache: "no-store" }
    );
    const data = await res.json();

    const isComplete = data.status === "complete" || data.paymentStatus === "paid";

    if (isComplete) {
      return (
        <PaymentSuccessModal
          title="Order & Payment Confirmed!"
          subtitle="Your payment has been verified by Stripe and your order has been received."
          orderId={sessionId.slice(0, 14)}
        />
      );
    }

    return (
      <div className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">Payment Status: {data.status || "Pending"}</h2>
        <p className="mt-1 text-sm text-gray-500">
          Payment state: {data.paymentStatus || "Processing"}
        </p>
        <Link
          href="/orders"
          className="mt-5 rounded-full bg-brand px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-brand-hover"
        >
          View My Orders
        </Link>
      </div>
    );
  } catch (err) {
    console.error("Error fetching session:", err);
    return (
      <PaymentSuccessModal
        title="Payment Submitted!"
        subtitle="Your checkout session was submitted successfully. Please check your orders tab for updates."
      />
    );
  }
};

export default ReturnPage;
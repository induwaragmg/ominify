"use client";

import ProductCard from "@/components/ProductCard";
import useWishlistStore from "@/stores/wishlistStore";
import { useAuth } from "@clerk/nextjs";
import { Heart, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

const WishlistPage = () => {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { fetchWishlist, hasLoaded, isLoading, products } = useWishlistStore();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      return;
    }

    getToken().then((token) => {
      if (token) {
        fetchWishlist(token);
      }
    });
  }, [fetchWishlist, getToken, isLoaded, isSignedIn]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-3xl border border-gray-100 bg-white px-6 py-8 shadow-sm">
          <h1 className="text-3xl font-semibold text-gray-900">
            Your Wishlist
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Sign in to save products and view them later.
          </p>
        </div>

        <div className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-gray-100 bg-white px-6 text-center shadow-sm">
          <Heart className="h-10 w-10 text-gray-400" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">
            Sign in required
          </h2>
          <p className="mt-2 max-w-md text-sm text-gray-500">
            Wishlist items are saved to your account so they stay available on
            every device.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-3xl border border-gray-100 bg-white px-6 py-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-gray-900">
          Your Wishlist
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Products you saved for later will appear here.
        </p>
      </div>

      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        {isLoading && !hasLoaded ? (
          <div className="flex min-h-80 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-surface px-6 text-center">
            <Heart className="h-10 w-10 text-gray-400" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              Your wishlist is empty
            </h2>
            <p className="mt-2 max-w-md text-sm text-gray-500">
              Tap the heart on products you like and they will show up here.
            </p>
            <Link
              href="/products"
              className="mt-5 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand/90"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;

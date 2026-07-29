"use client";

import type { AssistantProduct } from "@/types/assistant";
import useCartStore from "@/stores/cartStore";
import useWishlistStore from "@/stores/wishlistStore";
import { useAuth } from "@clerk/nextjs";
import { Heart, ShoppingCart, ExternalLink, Star, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

interface ProductRecommendationCardProps {
  product: AssistantProduct;
}

export default function ProductRecommendationCard({
  product,
}: ProductRecommendationCardProps): React.ReactNode {
  const { addToCart } = useCartStore();
  const { productIds, toggleWishlist } = useWishlistStore();
  const { getToken } = useAuth();

  const [isAdded, setIsAdded] = useState(false);
  const isWishlisted = productIds.includes(product.id);

  const imagesRecord = (product.images as Record<string, string> | undefined) ?? {};
  const image = Object.values(imagesRecord)[0] ?? "/products/1g.png";
  const firstSize = product.sizes?.[0] ?? "Standard";
  const firstColor = product.colors?.[0] ?? "Default";

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      shortDescription: product.shortDescription,
      description: "",
      images: product.images,
      sizes: product.sizes,
      colors: product.colors,
      categorySlug: "",
      createdAt: new Date(),
      updatedAt: new Date(),
      quantity: 1,
      selectedSize: firstSize,
      selectedColor: firstColor,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleToggleWishlist = async () => {
    try {
      const token = await getToken();
      if (token) {
        await toggleWishlist(product, token);
      }
    } catch {
      // Wishlist toggle error handled gracefully
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="mt-1.5 w-full rounded-xl border border-gray-100 bg-white p-2.5 shadow-xs transition-all hover:border-blue-100 hover:shadow-sm"
    >
      <div className="flex items-start gap-2.5">
        {/* Product Image */}
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-50 border border-gray-100">
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="56px"
            className="object-contain p-1 transition-transform duration-300 hover:scale-105"
          />
        </div>

        {/* Product Info */}
        <div className="min-w-0 flex-1">
          <h4 className="truncate text-xs font-semibold text-gray-950">
            {product.name}
          </h4>

          {/* Rating */}
          {product.rating != null && (
            <div className="mt-0.5 flex items-center gap-1">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-2.5 w-2.5 ${
                      i < Math.round(product.rating!)
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-200"
                    }`}
                  />
                ))}
              </div>
              {product.reviewCount != null && (
                <span className="text-[10px] text-gray-400">
                  ({product.reviewCount.toLocaleString()})
                </span>
              )}
            </div>
          )}

          <p className="mt-0.5 text-xs font-bold text-blue-600">
            ${(product.price > 1000 ? product.price / 100 : product.price).toFixed(2)}
          </p>

          <p className="mt-0.5 line-clamp-2 text-[11px] leading-tight text-gray-500">
            {product.shortDescription}
          </p>
        </div>
      </div>

      {/* Action Buttons - Fully responsive layout for narrow sidebar widths */}
      <div className="mt-2 flex items-center gap-1.5">
        <Link
          href={`/products/${product.id}`}
          className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-[11px] font-medium text-gray-700 transition-colors hover:bg-gray-50 shrink-0"
        >
          <ExternalLink className="h-3 w-3 shrink-0" />
          <span>View</span>
        </Link>
        <button
          type="button"
          onClick={handleAddToCart}
          className={`flex flex-1 items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-medium text-white transition-all shrink-0 ${
            isAdded
              ? "bg-emerald-600 hover:bg-emerald-700"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isAdded ? (
            <>
              <Check className="h-3 w-3 shrink-0" />
              <span>Added!</span>
            </>
          ) : (
            <>
              <ShoppingCart className="h-3 w-3 shrink-0" />
              <span className="truncate">Add to Cart</span>
            </>
          )}
        </button>
        <button
          type="button"
          onClick={handleToggleWishlist}
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-colors ${
            isWishlisted
              ? "border-red-200 bg-red-50 text-red-500"
              : "border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-500"
          }`}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`h-3.5 w-3.5 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
        </button>
      </div>
    </motion.div>
  );
}

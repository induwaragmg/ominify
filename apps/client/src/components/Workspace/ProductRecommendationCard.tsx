"use client";

import type { AssistantProduct } from "@/types/assistant";
import useCartStore from "@/stores/cartStore";
import { Heart, ShoppingCart, ExternalLink, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

interface ProductRecommendationCardProps {
  product: AssistantProduct;
}

export default function ProductRecommendationCard({
  product,
}: ProductRecommendationCardProps): React.ReactNode {
  const { addToCart } = useCartStore();
  const imagesRecord = (product.images as Record<string, string> | undefined) ?? {};
  const image = Object.values(imagesRecord)[0] ?? "/products/1g.png";
  const firstSize = product.sizes[0] ?? "Standard";
  const firstColor = product.colors[0] ?? "Default";

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
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="mt-2 rounded-xl border border-gray-100 bg-white p-3 shadow-sm"
    >
      <div className="flex gap-3">
        {/* Product Image */}
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-50">
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="64px"
            className="object-contain p-1"
          />
        </div>

        {/* Product Info */}
        <div className="min-w-0 flex-1">
          <h4 className="truncate text-sm font-semibold text-gray-950">
            {product.name}
          </h4>

          {/* Rating */}
          {product.rating != null && (
            <div className="mt-0.5 flex items-center gap-1">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
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

          <p className="mt-0.5 text-sm font-semibold text-blue-600">
            ${(product.price / 100).toFixed(2)}
          </p>

          <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">
            {product.shortDescription}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-2.5 flex items-center gap-2">
        <Link
          href={`/products/${product.id}`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          <ExternalLink className="h-3 w-3" />
          View
        </Link>
        <button
          type="button"
          onClick={handleAddToCart}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700"
        >
          <ShoppingCart className="h-3 w-3" />
          Add to Cart
        </button>
        <button
          type="button"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition-colors hover:border-red-200 hover:text-red-500"
          aria-label="Add to wishlist"
        >
          <Heart className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

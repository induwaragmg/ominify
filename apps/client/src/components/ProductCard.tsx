"use client";

import useCartStore from "@/stores/cartStore";
import useWishlistStore from "@/stores/wishlistStore";
import { useAuth } from "@clerk/nextjs";
import { ProductType } from "@repo/types";
import { Heart, Plus, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { MouseEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ProductCard = ({ product }: { product: ProductType }) => {
  const [productTypes, setProductTypes] = useState({
    size: product.sizes[0]!,
    color: product.colors[0]!,
  });

  const { addToCart } = useCartStore();
  const { getToken, isSignedIn } = useAuth();
  const { fetchWishlist, productIds, toggleWishlist } = useWishlistStore();
  const isWishlisted = productIds.includes(product.id);

  useEffect(() => {
    if (!isSignedIn) {
      return;
    }

    getToken().then((token) => {
      if (token) {
        fetchWishlist(token);
      }
    });
  }, [fetchWishlist, getToken, isSignedIn]);

  const handleProductType = ({
    type,
    value,
  }: {
    type: "size" | "color";
    value: string;
  }) => {
    setProductTypes((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const handleAddToCart = () => {
    addToCart({
      ...product,
      quantity: 1,
      selectedSize: productTypes.size,
      selectedColor: productTypes.color,
    });
    toast.success("Product added to cart")
  };

  const handleWishlist = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isSignedIn) {
      toast.error("Please sign in to use wishlist");
      return;
    }

    const token = await getToken();

    if (!token) {
      toast.error("Please sign in to use wishlist");
      return;
    }

    try {
      await toggleWishlist(product, token);
      toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
    } catch {
      toast.error("Could not update wishlist");
    }
  };

  return (
    <div className="group relative aspect-7/9 max-w-[288px] overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl">
      <Link
        href={`/products/${product.id}`}
        className=" absolute inset-x-0 top-0 bottom-25 z-10 block overflow-hidden"
      >
      </Link>
      {/* PRODUCT IMAGE */}
      <Image
        src={
          (product.images as Record<string, string>)?.[productTypes.color] ||
          "/products/placeholder.png"
        }
        alt={product.name}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-110"
      />

      {/* DARK GRADIENT */}
      {/* <div className="absolute inset-0 bg-linear-to-t from-brand/50 via-black/30 to-transparent" /> */}
      {/* <div className="absolute inset-0 bg-linear-to-t from-[color-mix(in_srgb,var(--color-brand)_90%,black)]/40 via-black/20 to-transparent" /> */}
      <div className="absolute inset-0 bg-linear-to-t from-black/50 via-black/25 to-transparent" />

      {/* TOP BADGES */}
      <div className="absolute   left-2 sm:left-4 right-2 sm:right-4 top-2 sm:top-4 flex items-center justify-between">
        <button
          onClick={handleWishlist}
          className="z-20 rounded-full bg-brand/40 px-2 py-2  text-xs text-white backdrop-blur-md transition hover:bg-brand/20"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`h-4 w-4 ${isWishlisted ? "fill-white text-white" : ""
              }`}
          />
        </button>
      </div>

      {/* CONTENT */}
      <div className="absolute   bottom-0 left-0 right-0 p-3 sm:p-5 text-white  bg-linear-to-t from-black/40 via-black/11 to-transparent">
        <h2 className="line-clamp-1 sm:line-clamp-2 text-md sm:text-lg font-bold">
          {product.name}
        </h2>

        <p className="sm:mt-1 text-md sm:text-xl ">
          ${product.price.toFixed(2)}
        </p>

        <p className="sm:mt-1 line-clamp-2 text-xs sm:text-sm text-white/90">
          {product.shortDescription}
        </p>
        <div className="mt-2 flex items-end justify-between gap-1.5 sm:gap-3 text-xs">
          {/* SIZES */}
          <div className="flex flex-col gap-0.5 shrink-0">
            <span className="text-gray-100 text-[10px] sm:text-xs font-semibold">Size</span>
            <Select
              value={productTypes.size}
              onValueChange={(value) =>
                value && handleProductType({ type: "size", value })
              }
            >
              <SelectTrigger className="ring ring-gray-50/80 rounded-full text-[11px] sm:text-xs text-white bg-transparent border-none focus:ring-1 focus:ring-gray-50 shadow-none outline-none flex items-center justify-between gap-1 min-w-[46px] sm:min-w-[54px] cursor-pointer [&_svg]:text-white [&_svg]:size-3 sm:[&_svg]:size-3.5">
                <SelectValue>
                  <span className="uppercase font-medium">{productTypes.size}</span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-white text-black min-w-[90px] rounded-xl p-1 shadow-xl z-50">
                {product.sizes.map((size) => (
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

          {/* COLORS */}
          <div className="flex flex-col gap-0.5 shrink-0">
            <span className="text-gray-100 text-[10px] sm:text-xs font-semibold">Color</span>
            <Select
              value={productTypes.color}
              onValueChange={(value) =>
                value && handleProductType({ type: "color", value })
              }
            >
              <SelectTrigger className="ring ring-gray-50/80 rounded-full text-[11px] sm:text-xs text-white bg-transparent border-none focus:ring-1 focus:ring-gray-50 shadow-none outline-none flex items-center justify-between gap-1 min-w-[46px] sm:min-w-[54px] cursor-pointer [&_svg]:text-white [&_svg]:size-3 sm:[&_svg]:size-3.5">
                <SelectValue>
                  <div className="flex items-center gap-1">
                    <div
                      className="h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full shrink-0 border border-white/40"
                      style={{ backgroundColor: productTypes.color }}
                    />
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-white text-black min-w-[110px] rounded-xl p-1 shadow-xl z-50">
                {product.colors.map((color) => (
                  <SelectItem
                    key={color}
                    value={color}
                    className="flex items-center gap-2 cursor-pointer rounded-lg px-2 py-1.5 text-xs text-black hover:bg-gray-100 focus:bg-gray-100"
                  >
                    <div
                      className="h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full shrink-0 border border-gray-300"
                      style={{ backgroundColor: color }}
                    />
                    <span className="capitalize font-medium">{color}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              handleAddToCart();
            }}
            className="hover:cursor-pointer flex items-center justify-center shrink-0 rounded-full bg-white px-2.5 py-2.5 sm:px-4 sm:py-2.25 text-black transition hover:bg-gray-100"
            aria-label="Add to cart"
          >
            <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </button>
        </div>

      </div>
    </div>

  );
};

export default ProductCard;

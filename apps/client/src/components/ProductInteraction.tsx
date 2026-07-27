"use client";

import useCartStore from "@/stores/cartStore";
import useWishlistStore from "@/stores/wishlistStore";
import { useAuth } from "@clerk/nextjs";
import { ProductType } from "@repo/types";
import { Heart, Minus, Plus, ShoppingCart } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const ProductInteraction = ({
  product,
  selectedSize,
  selectedColor,
}: {
  product: ProductType;
  selectedSize: string;
  selectedColor: string;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [quantity, setQuantity] = useState(1);

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

  const handleTypeChange = (type: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(type, value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleQuantityChange = (type: "increment" | "decrement") => {
    if (type === "increment") {
      setQuantity((prev) => prev + 1);
    } else {
      if (quantity > 1) {
        setQuantity((prev) => prev - 1);
      }
    }
  };

  const handleAddToCart = () => {
    addToCart({
      ...product,
      quantity,
      selectedColor,
      selectedSize,
    });
    toast.success("Product added to cart")
  };

  const handleWishlist = async () => {
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
    <div className="flex flex-col gap-4 mt-4 ">
      {/* SIZE */}
      <div className="flex flex-col gap-2 text-xs">
        <span className="text-gray-500">Size</span>
        <div className="flex items-center gap-2">
          {product.sizes.map((size) => (
            <div
              className={`cursor-pointer border rounded-full  ${
                selectedSize === size ? " ring-2 ring-gray-400" : "border-gray-300"
              }`}
              key={size}
              onClick={() => handleTypeChange("size", size)}
            >
              <div
                className={`w-6 h-6 text-center rounded-full flex items-center justify-center ${
                  selectedSize === size
                    ? "bg-brand text-white"
                    : "bg-white text-black"
                }`}
              >
                {size.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* COLOR */}
      <div className="flex flex-col gap-2 text-sm">
        <span className="text-gray-500">Color</span>
        <div className="flex items-center gap-2">
          {product.colors.map((color) => (
            <div
              className={`cursor-pointer rounded-full border  ${
                selectedColor === color ? "ring-2 ring-gray-400" : "border-white"
              }`}
              key={color}
              onClick={() => handleTypeChange("color", color)}
            >
              <div className={`w-6 h-6`} style={{ backgroundColor: color, borderRadius: "50%" }} />
            </div>
          ))}
        </div>
      </div>
      {/* QUANTITY */}
      <div className="flex flex-col gap-2 text-sm">
        <span className="text-gray-500">Quantity</span>
        <div className="flex items-center gap-2">
          <button
            className="cursor-pointer border rounded-full border-gray-300 p-1"
            onClick={() => handleQuantityChange("decrement")}
          >
            <Minus className="w-4 h-4" />
          </button>
          <span>{quantity}</span>
          <button
            className="cursor-pointer border rounded-full border-gray-300 p-1"
            onClick={() => handleQuantityChange("increment")}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
      {/* BUTTONS */}
     <div className="flex gap-4">
      <button
        onClick={handleAddToCart}
        className="bg-brand flex-1 text-white px-4 py-2 rounded-md shadow-lg flex items-center justify-center gap-2 cursor-pointer text-sm font-medium"
      >
        <Plus className="w-4 h-4" />
        Add to Cart
      </button>
      <button className=" flex-1 ring-1 ring-gray-400 shadow-lg text-gray-800 px-4 py-2 rounded-md flex items-center justify-center cursor-pointer gap-2 text-sm font-medium">
        <ShoppingCart className="w-4 h-4" />
        Buy this Item
      </button>
     </div>
      <button
        onClick={handleWishlist}
        className="ring-1 ring-gray-400 shadow-lg text-gray-800 px-4 py-2 rounded-md flex items-center justify-center cursor-pointer gap-2 text-sm font-medium"
      >
        <Heart
          className={`w-4 h-4 ${
            isWishlisted ? "fill-red-500 text-red-500" : ""
          }`}
        />
        {isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
      </button>
    </div>
  );
};

export default ProductInteraction;

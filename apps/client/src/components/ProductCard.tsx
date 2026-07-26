"use client";

import useCartStore from "@/stores/cartStore";
import { ProductType } from "@repo/types";
import { Heart, Plus, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "react-toastify";

const ProductCard = ({ product }: { product: ProductType }) => {
  const [productTypes, setProductTypes] = useState({
    size: product.sizes[0]!,
    color: product.colors[0]!,
  });

  const { addToCart } = useCartStore();

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

  return (
    // <div className="shadow-lg rounded-lg overflow-hidden w-full">
    //   {/* IMAGE */}
    //   <Link href={`/products/${product.id}`}>
    //     <div className="relative aspect-square w-full h-40">
    //       <Image
    //         src={(product.images as Record<string, string>)?.[productTypes.color] || ""} //put no image placeholder if no image
    //         alt={product.name}
    //         fill
    //         className="object-cover hover:scale-105 transition-all duration-300 h-full"
    //       />
    //     </div>
    //   </Link>
    //   {/* PRODUCT DETAIL */}
    //   <div className="flex flex-col gap-2 p-4 bg-surface">
    //     <h1 className="line-clamp-2 min-h-2 font-medium">{product.name}</h1>
    //     <p className="line-clamp-2 min-h-10 text-sm text-gray-500">{product.shortDescription}</p>
    //     {/* PRODUCT TYPES */}
    //     <div className="flex items-center gap-4 text-xs">
    //       {/* SIZES */}
    //       <div className="flex flex-col gap-1">
    //         <span className="text-gray-500">Size</span>
    //         <select
    //           name="size"
    //           id="size"
    //           className="ring ring-gray-300 rounded-md px-2 py-1"
    //           onChange={(e) =>
    //             handleProductType({ type: "size", value: e.target.value })
    //           }
    //         >
    //           {product.sizes.map((size) => (
    //             <option key={size} value={size}>
    //               {size.toUpperCase()}
    //             </option>
    //           ))}
    //         </select>
    //       </div>

    //       {/* COLORS */}
    //       <div className="flex flex-col gap-1">
    //         <span className="text-gray-500">Color</span>
    //         <div className="flex items-center gap-2">
    //           {product.colors.map((color) => (
    //             <div
    //               className={`cursor-pointer border ${
    //                 productTypes.color === color
    //                   ? "border-gray-400"
    //                   : "border-gray-200"
    //               } rounded-full p-[1.2px]`}
    //               key={color}
    //               onClick={() =>
    //                 handleProductType({ type: "color", value: color })
    //               }
    //             >
    //               <div
    //                 className="w-3.5 h-3.5 rounded-full"
    //                 style={{ backgroundColor: color }}
    //               />
    //             </div>
    //           ))}
    //         </div>
    //       </div>
    //     </div>
    //     {/* PRICE AND ADD TO CART BUTTON */}
    //     <div className="flex items-center justify-between">
    //       <p className="font-medium">${product.price.toFixed(2)}</p>
    //       <button
    //         onClick={handleAddToCart}
    //         className="ring-1  ring-gray-200 shadow-lg rounded-md px-2 py-1 text-sm cursor-pointer hover:text-white hover:bg-black transition-all duration-300 flex items-center gap-2"
    //       >
    //         <ShoppingCart className="w-4 h-4" />
    //         Add to Cart
    //       </button>
    //     </div>
    //   </div>
    // </div>
   
    <div className="group relative aspect-7/9 overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl">
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
      <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/30 to-transparent" />

      {/* TOP BADGES */}
      <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
        {/* <div className="rounded-full bg-white/20 px-3 py-1 text-xs text-white backdrop-blur-md">
          🚚 2–3 Days
        </div> */}

        <div className="rounded-full bg-white/10 px-2 py-2 text-xs text-white backdrop-blur-md">
          <Heart className="h-4 w-4" />
        </div>
      </div>

      {/* CONTENT */}
      <div className="absolute   bottom-0 left-0 right-0 p-5 text-white">
        <h2 className="line-clamp-2 text-lg font-bold">
          {product.name}
        </h2>

        <p className="mt-1 text-xl ">
          ${product.price.toFixed(2)}
        </p>

        <p className="mt-1 line-clamp-2 text-sm text-white/80">
          {product.shortDescription}
        </p>
        <div className="flex items-center justify-between  gap-4 text-xs">
         {/* SIZES */}
          <div className="flex flex-col gap-1">
            <span className="text-gray-50">Size</span>
            <select
              name="size"
              id="size"
              className="ring ring-gray-50 rounded-2xl px-2 py-1"
              onChange={(e) =>
                handleProductType({ type: "size", value: e.target.value })
              }
            >
              {product.sizes.map((size) => (
                <option key={size} value={size} className="text-black rounded-2xl">
                  {size.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* COLORS */}
          <div className="flex flex-col gap-1">
            <span className="text-gray-50">Color</span>
            <div className="flex items-center gap-2">
              {product.colors.map((color) => (
                <div
                  className={`cursor-pointer border ${
                    productTypes.color === color
                      ? "ring-1 ring-white border-0"
                      : "ring-1 ring-white/30 border-0"
                  } rounded-full p-[1.2px]`}
                  key={color}
                  onClick={() =>
                    handleProductType({ type: "color", value: color })
                  }
                >
                  <div
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                </div>
              ))}
            </div>
          </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            handleAddToCart();
          }}
          className="hover:cursor-pointer mt-2 flex px-5 items-center justify-center rounded-full bg-white py-2.5 font-semibold text-black transition hover:bg-gray-100"
        >
          <ShoppingCart className="h-5 w-5" />
          <Plus className="h-5 w-5" />
        </button>
        </div>

      </div>
    </div>
 
  );
};

export default ProductCard;
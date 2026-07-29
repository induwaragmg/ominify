import { ProductType } from "@repo/types";
import { create } from "zustand";

type WishlistItem = {
  id: number;
  productId: number;
  createdAt: string;
  product: ProductType;
};

type WishlistStore = {
  hasLoaded: boolean;
  isLoading: boolean;
  productIds: number[];
  products: ProductType[];
  fetchWishlist: (token: string) => Promise<void>;
  toggleWishlist: (product: ProductType, token: string) => Promise<void>;
  clearWishlist: () => void;
};

const getWishlistUrl = (path = "") =>
  `${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/wishlist${path}`;

const useWishlistStore = create<WishlistStore>((set, get) => ({
  hasLoaded: false,
  isLoading: false,
  productIds: [],
  products: [],
  fetchWishlist: async (token) => {
    const { hasLoaded, isLoading } = get();

    if (hasLoaded || isLoading) {
      return;
    }

    set({ isLoading: true });

    try {
      const res = await fetch(getWishlistUrl(), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch wishlist (${res.status})`);
      }

      const data = await res.json();
      const items = Array.isArray(data) ? (data as WishlistItem[]) : [];

      set({
        hasLoaded: true,
        isLoading: false,
        productIds: items.map((item) => item.productId),
        products: items.map((item) => item.product),
      });
    } catch (error) {
      console.error(error);
      set({ isLoading: false });
    }
  },
  toggleWishlist: async (product, token) => {
    const { productIds, products } = get();
    const isWishlisted = productIds.includes(product.id);
    const nextProductIds = isWishlisted
      ? productIds.filter((id) => id !== product.id)
      : [...productIds, product.id];
    const nextProducts = isWishlisted
      ? products.filter((item) => item.id !== product.id)
      : [product, ...products];

    set({
      hasLoaded: true,
      productIds: nextProductIds,
      products: nextProducts,
    });

    try {
      const res = await fetch(getWishlistUrl(`/${product.id}`), {
        method: isWishlisted ? "DELETE" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to update wishlist (${res.status})`);
      }
    } catch (error) {
      console.error(error);
      set({
        productIds,
        products,
      });

      throw error;
    }
  },
  clearWishlist: () =>
    set({
      hasLoaded: false,
      isLoading: false,
      productIds: [],
      products: [],
    }),
}));

export default useWishlistStore;

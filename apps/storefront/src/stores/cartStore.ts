import { CartStoreActionsType, CartStoreStateType } from "@repo/types";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useCartStore = create<CartStoreStateType & CartStoreActionsType>()(
  persist(
    (set) => ({ // set is a function that we will use to update the state of the store, it takes a callback function as an argument, the callback function receives the current state as an argument and should return the new state
      cart: [],// this is the initial state of the cart, it will be an array of products
      hasHydrated: false, // this is a flag to check if the store has been hydrated from localStorage, we will use this to avoid rendering the cart icon before the store is hydrated
      addToCart: (product) => // product prop is the product that we want to add to the cart, it should have the same structure as the products in the cart, but it can also have a quantity property that indicates how many of this product we want to add to the cart, if quantity is not provided, it will default to 1
        set((state) => { // state is the current state of the store, we will use it to check if the product we want to add is already in the cart, if it is, we will just increase the quantity of that product, if it is not, we will add it to the cart with the provided quantity or 1 if quantity is not provided
          // console.log("Adding to cart:" + "||||||||      product =" + JSON.stringify(product) + "   ######     state = " + JSON.stringify(state));
          const existingIndex = state.cart.findIndex(
            (p) =>
              p.id === product.id &&
              p.selectedSize === product.selectedSize &&
              p.selectedColor === product.selectedColor
          );

          if (existingIndex !== -1) {
            const updatedCart = [...state.cart]; // create a copy of the cart array
            updatedCart[existingIndex]!.quantity += product.quantity || 1; //  || 1 is used to ensure that if product.quantity is undefined, it will default to increase by 1
            //! is used to tell TypeScript that we are sure 
            // that updatedCart[existingIndex] is not undefined,
            //  because we have already checked that existingIndex is not -1, 
            // which means that the product exists in the cart
            return { cart: updatedCart };
          }

          // if the product is not already in the cart, we will add it to the cart with the provided quantity or 1 if quantity is not provided
          return { 
            cart: [
              ...state.cart,   // dropping elements of the array one by one so ... is a must
              {
                ...product,  // unpacking the product obj to get the all properties of it and make the new obj with below rest
                quantity: product.quantity || 1,
                selectedSize: product.selectedSize,
                selectedColor: product.selectedColor,
              },
            ],
          };
        }),
        //product is the product we want to remove from cart
      removeFromCart: (product) =>
        set((state) => ({  // state is the current cart state (array of products in the cart)
          cart: state.cart.filter(
            (p) =>
              !(
                p.id === product.id &&
                p.selectedSize === product.selectedSize &&
                p.selectedColor === product.selectedColor
              )
          ),
        })),

      updateCartItem: (oldItem, updates) =>
        set((state) => {
          const oldIndex = state.cart.findIndex(
            (p) =>
              p.id === oldItem.id &&
              p.selectedSize === oldItem.selectedSize &&
              p.selectedColor === oldItem.selectedColor
          );

          if (oldIndex === -1) return state;

          const newSize = updates.selectedSize ?? oldItem.selectedSize;
          const newColor = updates.selectedColor ?? oldItem.selectedColor;
          const newQuantity = updates.quantity ?? oldItem.quantity;

          if (newQuantity <= 0) {
            return {
              cart: state.cart.filter((_, index) => index !== oldIndex),
            };
          }

          const existingTargetIndex = state.cart.findIndex(
            (p, index) =>
              index !== oldIndex &&
              p.id === oldItem.id &&
              p.selectedSize === newSize &&
              p.selectedColor === newColor
          );

          const updatedCart = [...state.cart];

          if (existingTargetIndex !== -1) {
            updatedCart[existingTargetIndex] = {
              ...updatedCart[existingTargetIndex]!,
              quantity: updatedCart[existingTargetIndex]!.quantity + newQuantity,
            };
            updatedCart.splice(oldIndex, 1);
          } else {
            updatedCart[oldIndex] = {
              ...updatedCart[oldIndex]!,
              selectedSize: newSize,
              selectedColor: newColor,
              quantity: newQuantity,
            };
          }

          return { cart: updatedCart };
        }),

      // this action is used to clear the cart, we will use it after the user completes the order to clear the cart for the next order
      clearCart: () => set({ cart: [] }),
    }),
    // this is the configuration object for the persist middleware, 
    // we will use it to specify the name of the localStorage key and the storage engine (localStorage in this case)
    {
      name: "cart",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hasHydrated = true;
        }
      },
    }
  )
);

export default useCartStore;
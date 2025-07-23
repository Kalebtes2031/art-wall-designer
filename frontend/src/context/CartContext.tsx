// src/context/CartContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { useCartApi } from "../hooks/useCartApi";
import type { Cart } from "../types/Cart";

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  addToCart: (
    productId: string,
    sizeIndex: number
  ) => Promise<Cart | undefined>; // 🔥 fix here
  removeFromCart: (itemId: string) => Promise<void>;
  decrementCartItem: (itemId: string) => Promise<void>;
  refreshCart: () => Promise<void>;
  changeItemSize: (itemId: string, newSizeIndex: number) => Promise<void>;
  updateCartItemQuantity: (itemId: string, newQuantity: number) => Promise<void>;
}

const CartContext = createContext<CartContextType>({
  cart: null,
  loading: false,
  addToCart: async (_productId: string, _sizeIndex: number): Promise<Cart> => {
    throw new Error("addToCart not implemented");
  },
  removeFromCart: async () => {},
  decrementCartItem: async () => {},
  refreshCart: async () => {},
  changeItemSize: async () => {},
  updateCartItemQuantity: async () => {},
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { fetchCart, setItem, removeItem, decrementItem, changeItemSize, changeItemQuantity} =
    useCartApi();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchCart();
      setCart(data);
    } catch (err) {
      console.error("Cart load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const addToCart = async (
    productId: string,
    sizeIndex: number
  ): Promise<Cart | undefined> => {
    try {
      const updated = await setItem(productId, sizeIndex);
      setCart(updated);
      return updated; // ← now returns the cart!
    } catch (err) {
      console.error("Add to cart failed:", err);
      return undefined;
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const updated = await removeItem(itemId);
      setCart(updated);
    } catch (err) {
      console.error("Remove from cart failed:", err);
    }
  };

  const decrementCartItem = async (itemId: string) => {
    try {
      const updated = await decrementItem(itemId);
      setCart(updated);
    } catch (err) {
      console.error("Decrement cart item failed:", err);
    }
  };

  const updateCartItemQuantity = async (
    itemId: string,
    newQuantity: number
  ) => {
    await changeItemQuantity(itemId, newQuantity);
    await load();
  };

  const changeItemSizeInCart = async (itemId: string, newQuantity: number) => {
    try {
      const updated = await changeItemSize(itemId, newQuantity);
      setCart(updated);
    } catch (err) {
      console.error("Change item size failed:", err);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        removeFromCart,
        decrementCartItem,
        refreshCart: load,
        changeItemSize: changeItemSizeInCart,
        updateCartItemQuantity
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

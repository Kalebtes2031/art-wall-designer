// src/context/CartContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { useCartApi } from "../hooks/useCartApi";
import type { Cart } from "../types/Cart";
import { useAuth } from "./AuthContext"; // ✅ bring in token & user

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  addToCart: (productId: string, sizeIndex: number) => Promise<Cart | undefined>;
  removeFromCart: (itemId: string) => Promise<void>;
  decrementCartItem: (itemId: string) => Promise<void>;
  refreshCart: () => Promise<void>;
  changeItemSize: (itemId: string, newSizeIndex: number) => Promise<void>;
  updateCartItemQuantity: (itemId: string, newQuantity: number) => Promise<void>;
}

const CartContext = createContext<CartContextType>({
  cart: null,
  loading: false,
  addToCart: async () => {
    throw new Error("addToCart not implemented");
  },
  removeFromCart: async () => {},
  decrementCartItem: async () => {},
  refreshCart: async () => {},
  changeItemSize: async () => {},
  updateCartItemQuantity: async () => {},
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { fetchCart, setItem, removeItem, decrementItem, changeItemSize, changeItemQuantity } =
    useCartApi();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const { token } = useAuth(); // ✅ useAuth gives us token

  const load = async () => {
    if (!token) {
      setCart(null); // guest → local only
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchCart();
      setCart(data);
    } catch (err) {
      console.error("Cart load error:", err);
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token]); // ✅ reload when login/logout happens

  const addToCart = async (productId: string, sizeIndex: number): Promise<Cart | undefined> => {
    if (!token) {
      console.warn("Guest addToCart – handle locally in Designer");
      return undefined;
    }
    try {
      const updated = await setItem(productId, sizeIndex);
      setCart(updated);
      return updated;
    } catch (err) {
      console.error("Add to cart failed:", err);
      return undefined;
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!token) return;
    try {
      const updated = await removeItem(itemId);
      setCart(updated);
    } catch (err) {
      console.error("Remove from cart failed:", err);
    }
  };

  const decrementCartItem = async (itemId: string) => {
    if (!token) return;
    try {
      const updated = await decrementItem(itemId);
      setCart(updated);
    } catch (err) {
      console.error("Decrement cart item failed:", err);
    }
  };

  const updateCartItemQuantity = async (itemId: string, newQuantity: number) => {
    if (!token) return;
    await changeItemQuantity(itemId, newQuantity);
    await load();
  };

  const changeItemSizeInCart = async (itemId: string, newSizeIndex: number) => {
    if (!token) return;
    try {
      const updated = await changeItemSize(itemId, newSizeIndex);
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
        updateCartItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

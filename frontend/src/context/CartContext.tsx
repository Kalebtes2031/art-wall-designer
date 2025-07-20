// src/context/CartContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useCartApi } from '../hooks/useCartApi';
import type { Cart } from '../types/Cart';

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  addToCart: (productId: string, quantity?: number, sizeIndex?: number) => Promise<void>;
  updateItem: (productId: string, quantity: number, sizeIndex?: number) => Promise<void>;
  removeFromCart: (productId: string, sizeIndex: number) => Promise<void>;
  decrementCartItem: (productId: string, sizeIndex: number) => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({
  cart: null,
  loading: false,
  addToCart: async () => {},
  updateItem: async () => {},
  removeFromCart: async () => {},
  decrementCartItem: async () => {},
  refreshCart: async () => {},
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { fetchCart, setItem, removeItem, decrementItem } = useCartApi();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchCart();
      setCart(data);
    } catch (err) {
      console.error('Cart load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const addToCart = async (
    productId: string,
    quantity = 1,
    sizeIndex?: number
  ) => {
    const existing = cart?.items.find(i => i.product._id === productId && i.sizeIndex === sizeIndex);
    const newQty = (existing?.quantity || 0) + quantity;
    await setItem(productId, newQty, sizeIndex);
    await load();
  };

  const updateItem = async (productId: string, quantity: number, sizeIndex?: number) => {
    await setItem(productId, quantity, sizeIndex);
    await load();
  };

  const decrementCartItem = async (productId: string, sizeIndex: number) => {
  await decrementItem(productId, sizeIndex);
  await load();
};

  const removeFromCart = async (productId: string, sizeIndex: number) => {
    await removeItem(productId, sizeIndex);
    await load();
  };

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateItem, decrementCartItem, removeFromCart, refreshCart: load }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

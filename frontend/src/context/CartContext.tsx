// src/context/CartContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useCartApi } from '../hooks/useCartApi';
import type { Cart } from '../types/Cart';

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({
  cart: null,
  loading: false,
  addToCart: async () => {},
  updateItem: async () => {},
  removeFromCart: async () => {},
  refreshCart: async () => {},
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { fetchCart, setItem, removeItem } = useCartApi();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // initial load
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

  const addToCart = async (productId: string, quantity = 1) => {
    const existing = cart?.items.find(i => i.product._id === productId);
   const newQty   = (existing?.quantity || 0) + quantity;
   await setItem(productId, newQty);
    await load();
  };

  const updateItem = async (productId: string, quantity: number) => {
    await setItem(productId, quantity);
    await load();
  };

  const removeFromCart = async (productId: string) => {
    await removeItem(productId);
    await load();
  };

  const refreshCart = load;

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateItem, removeFromCart, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

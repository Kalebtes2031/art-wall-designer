// src/hooks/useCartApi.ts
import { useCallback } from 'react';
import api from '../utils/api';
import type { Cart } from '../types/Cart';

export function useCartApi() {
  // Fetch whole cart
  const fetchCart = useCallback(async (): Promise<Cart> => {
    const res = await api.get<Cart>('/cart');
    return res.data;
  }, []);

  // Add or update a line item
  const setItem = useCallback(async (productId: string, quantity: number) => {
    const res = await api.post<Cart>('/cart/items', { productId, quantity });
    return res.data;
  }, []);

  // Remove a line item
  const removeItem = useCallback(async (productId: string) => {
    const res = await api.delete<Cart>(`/cart/items/${productId}`);
    return res.data;
  }, []);

  return { fetchCart, setItem, removeItem };
}

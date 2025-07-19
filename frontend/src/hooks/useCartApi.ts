// frontend/src/hooks/useCartApi.ts
import { useState } from 'react';
import api from '../utils/api';

export function useCartApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.get('/cart');
      return res.data;
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to load cart');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (productId: string, qty = 1) => {
    setLoading(true); setError(null);
    try {
      await api.post('/cart/items', { productId, quantity: qty });
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to add item');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (productId: string) => {
    setLoading(true); setError(null);
    try {
      await api.delete(`/cart/items/${productId}`);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to remove item');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { fetchCart, addItem, removeItem, loading, error };
}

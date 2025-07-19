// frontend/src/hooks/useOrderApi.ts
import { useState } from 'react';
import api from '../utils/api';

// frontend/src/hooks/useOrderApi.ts
export function useOrderApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrder = async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.post('/orders');
      return res.data;
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to create order');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const payOrder = async (orderId: string) => {
    setLoading(true); setError(null);
    try {
      await api.post(`/orders/${orderId}/pay`);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to pay order');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const getOrders = async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.get('/orders');
      return res.data;
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to load orders');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { createOrder, payOrder, getOrders, loading, error };
}

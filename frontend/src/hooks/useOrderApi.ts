// src/hooks/useOrderApi.ts
import { useCallback } from 'react';
import api from '../utils/api';
import type { Order } from '../types/Order';

export function useOrderApi() {
  // Create a new order (from cart)
  const createOrder = useCallback(async (): Promise<Order> => {
    const res = await api.post<Order>('/orders');
    return res.data;
  }, []);

  // Pay an existing order
  const payOrder = useCallback(async (orderId: string): Promise<{ status: string }> => {
    const res = await api.post<{ status: string }>(`/orders/${orderId}/pay`);
    return res.data;
  }, []);

  // List orders for current user/role
  const listOrders = useCallback(async (): Promise<Order[]> => {
    const res = await api.get<Order[]>('/orders');
    return res.data;
  }, []);

  // Update order status (admin/seller)
  const updateStatus = useCallback(async (orderId: string, status: string): Promise<Order> => {
    const res = await api.patch<Order>(`/orders/${orderId}`, { status });
    return res.data;
  }, []);

  return { createOrder, payOrder, listOrders, updateStatus };
}

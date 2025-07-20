// src/hooks/useCartApi.ts
import { useCallback } from "react";
import api from "../utils/api";
import type { Cart } from "../types/Cart";

export function useCartApi() {
  // Fetch whole cart
  const fetchCart = useCallback(async (): Promise<Cart> => {
    const res = await api.get<Cart>("/cart");
    return res.data;
  }, []);

  // Add or update a line item, now with sizeIndex
  const setItem = useCallback(
    async (productId: string, quantity: number, sizeIndex?: number) => {
      // send sizeIndex if provided
      const body: any = { productId, quantity };
      if (sizeIndex != null) body.sizeIndex = sizeIndex;
      const res = await api.post<Cart>("/cart/items", body);
      return res.data;
    },
    []
  );

  // Update a line item quantity
  const decrementItem = useCallback(
    async (productId: string, sizeIndex: number) => {
      const url = `/cart/items/${productId}/decrement?sizeIndex=${sizeIndex}`;
      const res = await api.patch<Cart>(url);
      return res.data;
    },
    []
  );

  // Remove a line item
  const removeItem = useCallback(
    async (productId: string, sizeIndex?: number) => {
      const url =
        `/cart/items/${productId}` +
        (sizeIndex !== undefined ? `?sizeIndex=${sizeIndex}` : "");
      const res = await api.delete<Cart>(url);
      return res.data;
    },
    []
  );

  return { fetchCart, setItem, removeItem, decrementItem };
}

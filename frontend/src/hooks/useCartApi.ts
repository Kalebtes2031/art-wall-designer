// src/hooks/useCartApi.ts
import { useCallback } from "react";
import api from "../utils/api";
import type { Cart } from "../types/Cart";

export function useCartApi() {
  // Fetch entire cart
  const fetchCart = useCallback(async (): Promise<Cart> => {
    const res = await api.get<Cart>("/cart");
    return res.data;
  }, []);

  // Add a single item (no grouping) by productId + sizeIndex
  const setItem = useCallback(
    async (productId: string, sizeIndex: number) => {
      const res = await api.post<Cart>("/cart/items", { productId, sizeIndex });
      return res.data;
    },
    []
  );

  // Remove a specific item by cart-item _id
  const removeItem = useCallback(
    async (itemId: string) => {
      const res = await api.delete<Cart>(`/cart/items/${itemId}`);
      return res.data;
    },
    []
  );

  // Change an item's size by cart-item _id
  const changeItemSize = useCallback(
    async (itemId: string, newSizeIndex: number) => {
      const res = await api.patch<Cart>(`/cart/items/${itemId}/size`, { newSizeIndex });
      return res.data;
    },
    []
  );

  // Decrement (remove) one unit is same as delete
  const decrementItem = removeItem;

  return { fetchCart, setItem, removeItem, decrementItem, changeItemSize };
}

// src/types/Cart.ts

import type { Product } from './Product';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  user: string;           // user ID
  items: CartItem[];
  updatedAt: string;
}
